import typer
import json
import jsonschema
from typing_extensions import Annotated
from pathlib import Path
from bmyc.model.models import Configuration
from bmyc.asset_manager import cdnjs, github, unpkg, jsdelivr

app = typer.Typer()

def validate_config(config_file: Path):
    """Validates the configuration file against the JSON schema."""
    with open(config_file, "r") as f:
        config_data = json.load(f)
    with open(Path(__file__).parent / "bmyc.schema.json", "r") as f:
        schema = json.load(f)
    jsonschema.validate(instance=config_data, schema=schema)
    return config_data

def get_asset_manager(asset_manager_name: str):
    """Returns the asset manager module."""
    if asset_manager_name == "cdnjs":
        return cdnjs
    elif asset_manager_name == "github":
        return github
    elif asset_manager_name == "unpkg":
        return unpkg
    elif asset_manager_name == "jsdelivr":
        return jsdelivr
    else:
        raise ValueError(f"Unknown asset manager: {asset_manager_name}")

@app.command()
def main(
    config: Annotated[Path, typer.Option("--config", "-c", help="Path of the configuration file.")] = Path(".bmycconfig.json"),
    force: Annotated[bool, typer.Option("--force", "-f", help="Force update of configuration.")] = False,
    summary_pr: Annotated[Path, typer.Option("--summary-pr", "-s", help="Path of the generated markdown summary used to describe a Pull Request.")] = None,
):
    """Tool to bump assets based on a configuration file"""
    if not config.exists():
        print(f"Configuration file not found: {config}")
        raise typer.Exit(code=1)

    config_data = validate_config(config)
    config_model = Configuration.model_validate(config_data)
    updated_assets = []

    for asset in config_model.root:
        if asset.hold and not force:
            continue

        asset_manager = get_asset_manager(asset.asset_manager.name)
        latest_version = asset_manager.get_latest_version(asset.asset_manager)

        if latest_version != asset.current_version or force or not asset.current_version:
            old_version = asset.current_version or "N/A"
            print(f"Updating {asset.name} from {old_version} to {latest_version}")
            asset_content = asset_manager.get_asset_content(asset.asset_manager, latest_version)
            with open(asset.local_path, "wb") as f:
                f.write(asset_content)
            updated_assets.append({"asset": asset, "old_version": old_version, "new_version": latest_version})
            asset.current_version = latest_version

    with open(config, "w") as f:
        json.dump(config_model.model_dump(by_alias=True)["root"], f, indent=2)

    if summary_pr and updated_assets:
        with open(summary_pr, "w") as f:
            f.write("## BMYC Summary\n\n")
            f.write("## BMYC Summary\n\n")
            f.write("| Asset | Old Version | New Version |\n")
            f.write("|---|---|---|\n")
            for updated_asset in updated_assets:
                f.write(f"| {updated_asset['asset'].name} | {updated_asset['old_version']} | {updated_asset['new_version']} |\n")

if __name__ == "__main__":
    app()
