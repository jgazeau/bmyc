from pathlib import Path

from bmyc.cli_context import CliContext
from bmyc.model.asset import Asset

TEST_RESOURCES_PATH = Path("tests", "resources")
COMMONS_RESOURCES_PATH = Path(TEST_RESOURCES_PATH, "commons")
MODEL_RESOURCES_PATH = Path(TEST_RESOURCES_PATH, "model")


def dummy_cli_context():
    return CliContext(
        force=False,
        insecure=False,
        configuration=Path(MODEL_RESOURCES_PATH, "config-valid.json"),
        summary=None,
        github_token="dummy_github_token",
    )


def dummy_json_asset():
    return {
        "local_path": "/tmp",
        "cdnjs": {
            "library": "library",
            "file_path": "path/file.js",
        },
    }


def dummy_asset():
    asset = Asset.model_validate(dummy_json_asset())
    asset.current_version = "1.0.0"
    asset.package_name = "test-package"
    asset.name = "test-asset"
    return asset


def dummy_json_invalid_asset():
    return {
        "local_path": "/tmp",
        "unknown_provider": {},
    }
