from abc import ABC, abstractmethod
from importlib import import_module
from pathlib import Path
from pkgutil import iter_modules

from pydantic import BaseModel, ConfigDict

from bmyc.cli_context import CliContext
from bmyc.model.providers import provider as providers_module


def get_supported_providers() -> str:
    providers_path = Path(providers_module.__file__).parent
    for module_info in iter_modules([str(providers_path)]):
        if module_info.name != "provider":
            import_module(f"bmyc.model.providers.{module_info.name}")
    providers = sorted([c.__name__.lower() for c in Provider.__subclasses__()])
    return ", ".join(providers)


class Provider(BaseModel, ABC):
    model_config = ConfigDict(extra="forbid")

    @abstractmethod
    def get_latest_version(self, cli_context: CliContext) -> str:
        pass

    @abstractmethod
    def save_content(self, cli_context: CliContext, asset_version: str, save_path: Path):
        pass
