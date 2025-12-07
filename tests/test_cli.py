import json
from typer.testing import CliRunner
from pathlib import Path
from bmyc.main import app

runner = CliRunner()

def test_cli_help():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "Usage: main [OPTIONS]" in result.stdout

def test_cli_config_not_found():
    result = runner.invoke(app, ["--config", "nonexistent.json"])
    assert result.exit_code == 1
    assert "Configuration file not found" in result.stdout

def test_cli_update(tmp_path: Path):
    config_file = tmp_path / ".bmycconfig.json"
    asset_file = tmp_path / "asset.min.js"
    summary_file = tmp_path / "summary.md"

    config_data = [
        {
            "package": "package1",
            "name": "asset1",
            "localPath": str(asset_file),
            "assetManager": {
                "name": "cdnjs",
                "library": "jquery",
                "fileName": "jquery.min.js"
            },
            "currentVersion": "3.6.0"
        }
    ]
    with open(config_file, "w") as f:
        json.dump(config_data, f, indent=2)

    result = runner.invoke(app, ["--config", str(config_file), "--summary-pr", str(summary_file)])
    assert result.exit_code == 0
    assert "Updating asset1" in result.stdout

    with open(config_file, "r") as f:
        updated_config = json.load(f)
        assert updated_config[0]["currentVersion"] != "3.6.0"

    assert asset_file.exists()
    assert summary_file.exists()
