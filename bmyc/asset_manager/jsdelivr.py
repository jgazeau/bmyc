import requests
from bmyc.model.models import JsdelivrAssetManager

def get_latest_version(asset_manager: JsdelivrAssetManager) -> str:
    """Gets the latest version of a jsdelivr asset."""
    url = f"https://data.jsdelivr.com/v1/packages/{asset_manager.cdn}/{asset_manager.package}/resolved"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()["version"]

def get_asset_content(asset_manager: JsdelivrAssetManager, version: str) -> bytes:
    """Gets the content of a jsdelivr asset."""
    url = f"https://cdn.jsdelivr.net/{asset_manager.cdn}/{asset_manager.package}@{version}/{asset_manager.file_path}"
    response = requests.get(url)
    response.raise_for_status()
    return response.content
