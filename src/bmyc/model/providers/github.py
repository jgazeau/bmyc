import logging
import os
from pathlib import Path

import requests
from pydantic import Field

from bmyc.cli_context import CliContext
from bmyc.commons.bmyc_error import BmycError
from bmyc.model.providers.provider import Provider

GITHUB_API_URL = "https://api.github.com"


class Github(Provider):
    owner: str = Field(..., min_length=1)
    repository: str = Field(..., min_length=1)
    file_path: Path = Field(default_factory=Path)

    def get_latest_version(self, cli_context: CliContext) -> str:
        try:
            url = f"{GITHUB_API_URL}/repos/{self.owner}/{self.repository}/releases/latest"
            headers = {"Accept": "application/vnd.github.v3+json", "Authorization": f"token {cli_context.github_token}"}
            response = requests.get(url, headers=headers, verify=not cli_context.insecure)
            response.raise_for_status()
            version = response.json().get("tag_name")
            if version:
                logging.debug(f"Fetched latest version for {self.owner}/{self.repository} from GitHub: {version}")
                return version
            else:
                raise BmycError(f"Version information not found for {self.owner}/{self.repository} in GitHub response")
        except Exception as e:
            raise BmycError(f"Error while fetching latest version for {self.owner}/{self.repository} from GitHub: {str(e)}")

    def save_content(self, cli_context: CliContext, asset_version: str, save_path: Path):
        try:
            url = f"{GITHUB_API_URL}/repos/{self.owner}/{self.repository}/contents/{self.file_path}?ref={asset_version}"
            headers = {"Accept": "application/vnd.github.raw+json", "Authorization": f"token {cli_context.github_token}"}
            response = requests.get(url, headers=headers, stream=True, verify=not cli_context.insecure)
            response.raise_for_status()
            logging.debug(f"Fetched content for {self.file_path} from {self.owner}/{self.repository} version {asset_version} from GitHub")
            if not os.path.exists(save_path.parent):
                logging.debug(f"Creating directory {save_path.parent}.")
                os.makedirs(save_path.parent)
            with open(save_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
        except Exception as e:
            raise BmycError(
                f"Error while fetching content for {self.file_path} from {self.owner}/{self.repository} version {asset_version} from GitHub: {str(e)}"
            )
