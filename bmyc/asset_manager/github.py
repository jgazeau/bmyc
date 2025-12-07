import requests
import os
from bmyc.model.models import GithubAssetManager

def get_latest_version(asset_manager: GithubAssetManager) -> str:
    """Gets the latest version of a github asset."""
    url = f"https://api.github.com/repos/{asset_manager.owner}/{asset_manager.repository}/releases/latest"
    headers = {}
    if "BMYC_GITHUB_TOKEN" in os.environ:
        headers["Authorization"] = f"token {os.environ['BMYC_GITHUB_TOKEN']}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()["tag_name"]

def get_asset_content(asset_manager: GithubAssetManager, version: str) -> bytes:
    """Gets the content of a github asset."""
    url = f"https://raw.githubusercontent.com/{asset_manager.owner}/{asset_manager.repository}/{version}/{asset_manager.file_path}"
    headers = {}
    if "BMYC_GITHUB_TOKEN" in os.environ:
        headers["Authorization"] = f"token {os.environ['BMYC_GITHUB_TOKEN']}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.content
