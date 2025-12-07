import requests
from bmyc.model.models import CdnjsAssetManager

def get_latest_version(asset_manager: CdnjsAssetManager) -> str:
    """Gets the latest version of a cdnjs asset."""
    url = f"https://api.cdnjs.com/libraries/{asset_manager.library}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()["version"]

def get_asset_content(asset_manager: CdnjsAssetManager, version: str) -> bytes:
    """Gets the content of a cdnjs asset."""
    url = f"https://cdnjs.cloudflare.com/ajax/libs/{asset_manager.library}/{version}/{asset_manager.file_name}"
    response = requests.get(url)
    response.raise_for_status()
    return response.content
