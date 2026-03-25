import logging
import os
from pathlib import Path

import requests
from pydantic import Field

from bmyc.cli_context import CliContext
from bmyc.commons.bmyc_error import BmycError
from bmyc.model.providers.provider import Provider

CDNJS_API_URL = "https://api.cdnjs.com"
CDNJS_CDN_HOST = "https://cdnjs.cloudflare.com"
CDNJS_CDN_ROOT_PATH = "ajax/libs"
CDNJS_LIBRARIES_PATH = "libraries"


class Cdnjs(Provider):
    library: str = Field(..., min_length=1)
    file_path: Path = Field(default_factory=Path)

    def get_latest_version(self, cli_context: CliContext) -> str:
        try:
            url = f"{CDNJS_API_URL}/{CDNJS_LIBRARIES_PATH}/{self.library}"
            params = {"fields": "version"}
            response = requests.get(url, params=params, verify=not cli_context.insecure)
            response.raise_for_status()
            version = response.json().get("version")
            if version:
                logging.debug(f"Fetched latest version for {self.library} from Cdnjs: {version}")
                return version
            else:
                raise BmycError(f"Version information not found for {self.library} in Cdnjs response")
        except Exception as e:
            raise BmycError(f"Error while fetching latest version for {self.library} from Cdnjs: {str(e)}")

    def save_content(self, cli_context: CliContext, asset_version: str, save_path: Path):
        try:
            url = f"{CDNJS_CDN_HOST}/{CDNJS_CDN_ROOT_PATH}/{self.library}/{asset_version}/{self.file_path}"
            response = requests.get(url, stream=True, verify=not cli_context.insecure)
            response.raise_for_status()
            logging.debug(f"Fetched content for {self.file_path} from {self.library} version {asset_version} from Cdnjs")
            if not os.path.exists(save_path.parent):
                logging.debug(f"Creating directory {save_path.parent}.")
                os.makedirs(save_path.parent)
            with open(save_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
        except Exception as e:
            raise BmycError(f"Error while fetching content for {self.file_path} from {self.library} version {asset_version} from Cdnjs: {str(e)}")
