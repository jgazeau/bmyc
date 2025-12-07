from bmyc.asset_manager import github, unpkg, jsdelivr
from bmyc.model.models import GithubAssetManager, UnpkgAssetManager, JsdelivrAssetManager
import pytest

@pytest.fixture
def github_asset_manager():
    return GithubAssetManager(
        name="github",
        owner="jgazeau",
        repository="bmyc",
        filePath="README.md"
    )

@pytest.fixture
def unpkg_asset_manager():
    return UnpkgAssetManager(
        name="unpkg",
        library="jquery",
        filePath="dist/jquery.min.js"
    )

@pytest.fixture
def jsdelivr_asset_manager():
    return JsdelivrAssetManager(
        name="jsdelivr",
        cdn="npm",
        package="jquery",
        filePath="dist/jquery.min.js"
    )

def test_get_latest_version_github(github_asset_manager):
    latest_version = github.get_latest_version(github_asset_manager)
    assert latest_version is not None

def test_get_latest_version_unpkg(unpkg_asset_manager):
    latest_version = unpkg.get_latest_version(unpkg_asset_manager)
    assert latest_version is not None

def test_get_latest_version_jsdelivr(jsdelivr_asset_manager):
    latest_version = jsdelivr.get_latest_version(jsdelivr_asset_manager)
    assert latest_version is not None
