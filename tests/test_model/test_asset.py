import asyncio
import unittest
from pathlib import Path
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from bmyc.commons.common_constants import NOT_AVAILABLE
from bmyc.model.asset import Asset
from bmyc.model.asset_status_enum import AssetStatusEnum
from bmyc.model.providers.cdnjs import Cdnjs
from tests.commons.helpers import dummy_asset, dummy_cli_context, dummy_json_asset, dummy_json_invalid_asset


class TestAsset(unittest.TestCase):
    def test_asset_should_have_correct_properties(self):
        asset = Asset.model_validate(dummy_json_asset())
        assert asset.local_path == Path(dummy_json_asset()["local_path"])
        assert isinstance(asset.provider, Cdnjs)
        assert not asset.hold
        assert asset.current_version is None
        assert asset.provider.library == "library"
        assert asset.provider.file_path == Path("path/file.js")

    def test_asset_should_raise_error_when_extract_provider_invalid_missing(self):
        with pytest.raises(ValueError) as e:
            Asset.model_validate(dummy_json_invalid_asset())
        assert "No provider found" in str(e.value)

    def test_asset_should_raise_error_when_extract_provider_invalid_not_dict(self):
        with pytest.raises(ValueError) as e:
            Asset.model_validate("not a dict")
        assert "Provider data must be a dictionary" in str(e.value)

    def test_asset_should_raise_error_when_hold_requires_current_version(self):
        data = dummy_json_asset()
        data["hold"] = True
        with pytest.raises(ValidationError) as e:
            Asset.model_validate(data)
        assert "current_version must be set when hold is True" in str(e.value)

    def test_asset_should_validate_hold_with_current_version(self):
        data = dummy_json_asset()
        data["hold"] = True
        data["current_version"] = "1.0.0"
        asset = Asset.model_validate(data)
        assert asset.hold is True
        assert asset.current_version == "1.0.0"

    def test_asset_should_serialize(self):
        asset = Asset.model_validate(dummy_json_asset())
        serialized = asset.model_dump()
        assert serialized == {
            "local_path": Path("/tmp"),
            "hold": False,
            "current_version": None,
            "cdnjs": {
                "library": "library",
                "file_path": Path("path/file.js"),
            },
        }

    def test_get_version_display_should_return_correct_format(self):
        asset = Asset.model_validate(dummy_json_asset())
        assert asset._get_version_display("1.0.0", "2.0.0") == "1.0.0 -> 2.0.0"
        assert asset._get_version_display("1.0.0", None) == "1.0.0"
        assert asset._get_version_display(None, "2.0.0") == "2.0.0"
        assert asset._get_version_display(None, None) == NOT_AVAILABLE

    def test_get_bump_status_should_return_error_when_exception(self):
        asset = Asset.model_validate(dummy_json_asset())
        cli_context = dummy_cli_context()
        assert asset._get_bump_status("2.0", cli_context, exception=Exception("Some error")) == AssetStatusEnum.ERROR

    def test_get_bump_status_should_return_outdated_when_hold_and_outdated(self):
        asset = Asset.model_validate(dummy_json_asset())
        cli_context = dummy_cli_context()
        asset.hold = True
        asset.current_version = "1.0"
        assert asset._get_bump_status("2.0", cli_context) == AssetStatusEnum.OUTDATED

    def test_get_bump_status_should_return_up_to_date_when_hold_and_up_to_date(self):
        asset = Asset.model_validate(dummy_json_asset())
        cli_context = dummy_cli_context()
        asset.hold = True
        asset.current_version = "1.0"
        assert asset._get_bump_status("1.0", cli_context) == AssetStatusEnum.UP_TO_DATE

    def test_get_bump_status_should_return_updated_when_not_hold_and_outdated(self):
        asset = Asset.model_validate(dummy_json_asset())
        cli_context = dummy_cli_context()
        asset.hold = False
        asset.current_version = "1.0"
        cli_context.force = False
        assert asset._get_bump_status("2.0", cli_context) == AssetStatusEnum.UPDATED

    def test_get_bump_status_should_return_up_to_date_when_not_hold_and_up_to_date(self):
        asset = Asset.model_validate(dummy_json_asset())
        cli_context = dummy_cli_context()
        asset.hold = False
        asset.current_version = "1.0"
        cli_context.force = False
        assert asset._get_bump_status("1.0", cli_context) == AssetStatusEnum.UP_TO_DATE

    def test_get_bump_status_should_return_updated_when_force(self):
        asset = Asset.model_validate(dummy_json_asset())
        cli_context = dummy_cli_context()
        asset.hold = False
        asset.current_version = "1.0"
        cli_context.force = True
        assert asset._get_bump_status("1.0", cli_context) == AssetStatusEnum.UPDATED

    @patch("bmyc.model.asset.ResultsHandler")
    @patch.object(Cdnjs, "get_latest_version", return_value="2.0.0")
    @patch.object(Cdnjs, "save_content")
    def test_bump_to_latest_version_should_update_when_no_current_version(self, mock_save, _mock_get, mock_results_handler):
        asset = dummy_asset()
        cli_context = dummy_cli_context()
        asyncio.run(asset.bump_to_latest_version(cli_context))
        assert asset.current_version == "2.0.0"
        mock_save.assert_called_once_with(cli_context, "2.0.0", asset.local_path)
        mock_results_handler.return_value.add_result.assert_called_once()
        call_args = mock_results_handler.return_value.add_result.call_args[0]
        assert call_args[0] == asset.package_name
        assert call_args[1] == asset.name
        assert call_args[2] == "2.0.0 -> 2.0.0"
        assert call_args[3] is False
        assert call_args[4] == AssetStatusEnum.UP_TO_DATE

    @patch("bmyc.model.asset.ResultsHandler")
    @patch.object(Cdnjs, "get_latest_version", return_value="2.0.0")
    @patch.object(Cdnjs, "save_content")
    def test_bump_to_latest_version_should_update_when_version_changed(self, mock_save, _mock_get, mock_results_handler):
        asset = dummy_asset()
        cli_context = dummy_cli_context()
        asyncio.run(asset.bump_to_latest_version(cli_context))
        assert asset.current_version == "2.0.0"
        mock_save.assert_called_once()
        mock_results_handler.return_value.add_result.assert_called_once()
        call_args = mock_results_handler.return_value.add_result.call_args[0]
        assert call_args[2] == "2.0.0 -> 2.0.0"
        assert call_args[4] == AssetStatusEnum.UP_TO_DATE

    @patch("bmyc.model.asset.ResultsHandler")
    @patch.object(Cdnjs, "get_latest_version", return_value="2.0.0")
    @patch.object(Cdnjs, "save_content")
    def test_bump_to_latest_version_should_skip_when_on_hold(self, mock_save, _mock_get, mock_results_handler):
        asset = dummy_asset()
        asset.hold = True
        cli_context = dummy_cli_context()
        asyncio.run(asset.bump_to_latest_version(cli_context))
        assert asset.current_version == "1.0.0"
        mock_save.assert_not_called()
        mock_results_handler.return_value.add_result.assert_called_once()
        call_args = mock_results_handler.return_value.add_result.call_args[0]
        assert call_args[4] == AssetStatusEnum.OUTDATED

    @patch("bmyc.model.asset.ResultsHandler")
    @patch.object(Cdnjs, "get_latest_version", return_value="2.0.0")
    @patch.object(Cdnjs, "save_content")
    def test_bump_to_latest_version_should_not_update_when_up_to_date(self, mock_save, _mock_get, mock_results_handler):
        asset = dummy_asset()
        asset.current_version = "2.0.0"
        cli_context = dummy_cli_context()
        asyncio.run(asset.bump_to_latest_version(cli_context))
        assert asset.current_version == "2.0.0"
        mock_save.assert_not_called()
        mock_results_handler.return_value.add_result.assert_called_once()
        call_args = mock_results_handler.return_value.add_result.call_args[0]
        assert call_args[4] == AssetStatusEnum.UP_TO_DATE

    @patch("bmyc.model.asset.ResultsHandler")
    @patch.object(Cdnjs, "get_latest_version", return_value="1.0.0")
    @patch.object(Cdnjs, "save_content")
    def test_bump_to_latest_version_should_update_when_force(self, mock_save, _mock_get, mock_results_handler):
        asset = dummy_asset()
        cli_context = dummy_cli_context()
        cli_context.force = True
        asyncio.run(asset.bump_to_latest_version(cli_context))
        assert asset.current_version == "1.0.0"
        mock_save.assert_called_once_with(cli_context, "1.0.0", asset.local_path)
        mock_results_handler.return_value.add_result.assert_called_once()
        call_args = mock_results_handler.return_value.add_result.call_args[0]
        assert call_args[4] == AssetStatusEnum.UPDATED

    @patch("bmyc.model.asset.ResultsHandler")
    @patch.object(Cdnjs, "get_latest_version", return_value="2.0.0")
    @patch.object(Cdnjs, "save_content", side_effect=Exception("Save failed"))
    def test_bump_to_latest_version_should_handle_exception(self, _mock_save, _mock_get, mock_results_handler):
        asset = dummy_asset()
        cli_context = dummy_cli_context()
        asyncio.run(asset.bump_to_latest_version(cli_context))
        assert asset.current_version == "1.0.0"
        mock_results_handler.return_value.add_result.assert_called_once()
        call_args = mock_results_handler.return_value.add_result.call_args[0]
        assert call_args[4] == AssetStatusEnum.ERROR
        assert "Save failed" in call_args[5]
