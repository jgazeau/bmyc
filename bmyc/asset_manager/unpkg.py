import requests
from bmyc.model.models import UnpkgAssetManager

def get_latest_version(asset_manager: UnpkgAssetManager) -> str:
    """Gets the latest version of an unpkg asset."""
    url = f"https://registry.npmjs.org/{asset_manager.library}/latest"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()["version"]

def get_asset_content(asset_manager: UnpkgAssetManager, version: str) -> bytes:
    """Gets the content of an unpkg asset."""
    url = f"https://unpkg.com/{asset_manager.library}@{version}/{asset_manager.file_path}"
    response = requests.get(url)
    response.raise_for_status()
    return response.content
