import logging
import os
from pathlib import Path

import requests
from pydantic import Field

from bmyc.cli_context import CliContext
from bmyc.commons.bmyc_error import BmycError
from bmyc.model.providers.provider import Provider

JSDELIVR_API_URL = "https://data.jsdelivr.com/v1"
JSDELIVR_CDN_HOST = "https://cdn.jsdelivr.net"
JSDELIVR_LIBRARIES_PATH = "package"


class Jsdelivr(Provider):
    cdn: str = Field(..., min_length=1)
    package: str = Field(..., min_length=1)
    file_path: Path = Field(default_factory=Path)

    def get_latest_version(self, cli_context: CliContext) -> str:
        try:
            url = f"{JSDELIVR_API_URL}/{JSDELIVR_LIBRARIES_PATH}/{self.cdn}/{self.package}"
            response = requests.get(url, verify=not cli_context.insecure)
            response.raise_for_status()
            version = response.json().get("tags", {}).get("latest")
            if version:
                logging.debug(f"Fetched latest version for {self.cdn}/{self.package} from Jsdelivr: {version}")
                return version
            else:
                raise BmycError(f"Version information not found for {self.cdn}/{self.package} in Jsdelivr response")
        except Exception as e:
            raise BmycError(f"Error while fetching latest version for {self.cdn}/{self.package} from Jsdelivr: {str(e)}")

    def save_content(self, cli_context: CliContext, asset_version: str, save_path: Path):
        try:
            url = f"{JSDELIVR_CDN_HOST}/{self.cdn}/{self.package}@{asset_version}/{self.file_path}"
            response = requests.get(url, stream=True, verify=not cli_context.insecure)
            response.raise_for_status()
            logging.debug(f"Fetched content for {self.file_path} from {self.cdn}/{self.package} version {asset_version} from Jsdelivr")
            if not os.path.exists(save_path.parent):
                logging.debug(f"Creating directory {save_path.parent}.")
                os.makedirs(save_path.parent)
            with open(save_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
        except Exception as e:
            raise BmycError(f"Error while fetching content for {self.file_path} from {self.cdn}/{self.package} version {asset_version} from Jsdelivr: {str(e)}")
