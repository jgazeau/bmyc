from bmyc.asset_manager import cdnjs
from bmyc.model.models import CdnjsAssetManager
import pytest

@pytest.fixture
def cdnjs_asset_manager():
    return CdnjsAssetManager(
        name="cdnjs",
        library="jquery",
        fileName="jquery.min.js"
    )

def test_get_latest_version(cdnjs_asset_manager):
    latest_version = cdnjs.get_latest_version(cdnjs_asset_manager)
    assert latest_version is not None
