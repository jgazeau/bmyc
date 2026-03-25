import logging
from pathlib import Path
from typing import Optional, Union

from pydantic import BaseModel, Field, PrivateAttr, model_serializer, model_validator

from bmyc.cli_context import CliContext
from bmyc.commons.common_constants import NOT_AVAILABLE
from bmyc.model.asset_status_enum import AssetStatusEnum
from bmyc.model.providers.cdnjs import Cdnjs
from bmyc.model.providers.github import Github
from bmyc.model.providers.jsdelivr import Jsdelivr
from bmyc.model.providers.provider import Provider
from bmyc.model.providers.unpkg import Unpkg
from bmyc.results_handler import ResultsHandler


class Asset(BaseModel):
    local_path: Path = Field(default_factory=Path)
    hold: bool = Field(default=False)
    current_version: Optional[str] = Field(default=None)
    provider: Union[Cdnjs, Github, Jsdelivr, Unpkg]
    _package_name: str = PrivateAttr(default="")
    _name: str = PrivateAttr(default="")

    @property
    def package_name(self) -> str:
        return self._package_name

    @package_name.setter
    def package_name(self, value: str):
        self._package_name = value

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str):
        self._name = value

    @model_validator(mode="before")
    @classmethod
    def extract_provider(cls, data):
        if isinstance(data, dict):
            providers = {c.__name__.lower(): c for c in Provider.__subclasses__()}
            key = next((k for k in providers if k in data), None)
            if key:
                return {**{k: v for k, v in data.items() if k != key}, "provider": providers[key].model_validate(data[key])}
            else:
                raise ValueError(f"No provider found. Expected one of: {', '.join(sorted(providers))}.")
        else:
            raise ValueError("Provider data must be a dictionary.")

    @model_validator(mode="after")
    def validate_hold_requires_current_version(self):
        if self.hold and not self.current_version:
            raise ValueError("current_version must be set when hold is True")
        return self

    @model_serializer
    def serialize(self) -> dict:
        return {
            "local_path": self.local_path,
            "hold": self.hold,
            "current_version": self.current_version,
            type(self.provider).__name__.lower(): self.provider.model_dump(),
        }

    async def bump_to_latest_version(self, cli_context: CliContext) -> None:
        try:
            latest_version = self.provider.get_latest_version(cli_context)
            logging.debug(f"Found latest version: {latest_version}")
            if self.hold:
                logging.debug(f"Asset is on hold with version {self.current_version}. Skipping version bump.")
            else:
                if cli_context.force or (self.current_version != latest_version):
                    logging.debug(f"Bumping asset from version {self.current_version} to {latest_version}...")
                    self.provider.save_content(cli_context, latest_version, self.local_path)
                    self.current_version = latest_version
                else:
                    logging.debug(f"Asset is already at the latest version {self.current_version}. No bump needed.")
            ResultsHandler().add_result(
                self.package_name,
                self.name,
                self._get_version_display(self.current_version, latest_version),
                self.hold,
                self._get_bump_status(latest_version, cli_context),
                str(self.local_path),
            )
        except Exception as e:
            logging.debug(f"Error while bumping asset to latest version: {e}")
            ResultsHandler().add_result(
                self.package_name,
                self.name,
                self._get_version_display(self.current_version, latest_version),
                self.hold,
                self._get_bump_status(latest_version, cli_context, e),
                str(e),
            )

    def _get_bump_status(self, latest_version: str, cli_context: CliContext, exception: Exception | None = None) -> AssetStatusEnum:
        if exception:
            return AssetStatusEnum.ERROR
        elif self.hold:
            if self.current_version and self.current_version == latest_version:
                return AssetStatusEnum.UP_TO_DATE
            else:
                return AssetStatusEnum.OUTDATED
        else:
            if cli_context.force or (self.current_version != latest_version):
                return AssetStatusEnum.UPDATED
            else:
                return AssetStatusEnum.UP_TO_DATE

    def _get_version_display(self, current_version: str | None, latest_version: str | None) -> str:
        if current_version and latest_version:
            return f"{current_version} -> {latest_version}"
        elif current_version:
            return current_version
        elif latest_version:
            return latest_version
        else:
            return NOT_AVAILABLE
