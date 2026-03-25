import logging
import os
import re
from pathlib import Path

import requests
from pydantic import Field

from bmyc.cli_context import CliContext
from bmyc.commons.bmyc_error import BmycError
from bmyc.model.providers.provider import Provider

UNPKG_API_URL = "https://unpkg.com"


class Unpkg(Provider):
    library: str = Field(..., min_length=1)
    file_path: Path = Field(default_factory=Path)

    def get_latest_version(self, cli_context: CliContext) -> str:
        try:
            url = f"{UNPKG_API_URL}/{self.library}/"
            response = requests.get(url, allow_redirects=True, verify=not cli_context.insecure)
            response.raise_for_status()
            version = re.search(r".*@([^/]+)", response.url)
            if version:
                logging.debug(f"Fetched latest version for {self.library} from Unpkg: {version}")
                return version.group(1)
            else:
                raise BmycError(f"Version information not found for {self.library} in Unpkg response")
        except Exception as e:
            raise BmycError(f"Error while fetching latest version for {self.library} from Unpkg: {str(e)}")

    def save_content(self, cli_context: CliContext, asset_version: str, save_path: Path):
        try:
            url = f"{UNPKG_API_URL}/{self.library}@{asset_version}/{self.file_path}"
            response = requests.get(url, stream=True, verify=not cli_context.insecure)
            response.raise_for_status()
            logging.debug(f"Fetched content for {self.file_path} from {self.library} version {asset_version} from Unpkg")
            if not os.path.exists(save_path.parent):
                logging.debug(f"Creating directory {save_path.parent}.")
                os.makedirs(save_path.parent)
            with open(save_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
        except Exception as e:
            raise BmycError(f"Error while fetching content for {self.file_path} from {self.library} version {asset_version} from Unpkg: {str(e)}")
