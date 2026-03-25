import asyncio
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from bmyc.cli_context import CliContext
from bmyc.commons.bmyc_error import BmycError
from bmyc.processor import Processor
from tests.commons.helpers import MODEL_RESOURCES_PATH, dummy_cli_context


class TestProcessor(unittest.TestCase):
    def test_processor_should_initialize_when_json_configuration_is_valid(self):
        cli_context = CliContext(
            configuration=Path(MODEL_RESOURCES_PATH, "config-valid.json"),
            summary=None,
            force=False,
            insecure=False,
            github_token="dummy_token",
        )
        processor = Processor(cli_context)
        assert isinstance(processor, Processor)

    def test_processor_should_initialize_when_yaml_configuration_is_valid(self):
        cli_context = CliContext(
            configuration=Path(MODEL_RESOURCES_PATH, "config-valid.yaml"),
            summary=None,
            force=False,
            insecure=False,
            github_token="dummy_token",
        )
        processor = Processor(cli_context)
        assert isinstance(processor, Processor)

    def test_processor_should_raise_error_when_json_configuration_requires_github_token(self):
        cli_context = CliContext(
            configuration=Path(MODEL_RESOURCES_PATH, "config-valid.json"),
            summary=None,
            force=False,
            insecure=False,
            github_token=None,
        )
        with self.assertRaisesRegex(BmycError, "GitHub token is required for asset 'multi_package.github_asset' with GitHub provider"):
            Processor(cli_context)

    def test_processor_should_raise_error_when_yaml_configuration_requires_github_token(self):
        cli_context = CliContext(
            configuration=Path(MODEL_RESOURCES_PATH, "config-valid.yaml"),
            summary=None,
            force=False,
            insecure=False,
            github_token=None,
        )
        with self.assertRaisesRegex(BmycError, "GitHub token is required for asset 'multi_package.github_asset' with GitHub provider"):
            Processor(cli_context)

    def test_processor_should_raise_error_when_json_configuration_has_duplicate_local_paths(self):
        cli_context = CliContext(
            configuration=Path(MODEL_RESOURCES_PATH, "config-duplicate-local-paths.json"),
            summary=None,
            force=False,
            insecure=False,
            github_token="dummy_token",
        )
        with self.assertRaisesRegex(BmycError, "Duplicate local paths found for assets: package1.asset1, package1.asset2, package1.asset3, package2.asset1"):
            Processor(cli_context)

    def test_processor_should_raise_error_when_yaml_configuration_has_duplicate_local_paths(self):
        cli_context = CliContext(
            configuration=Path(MODEL_RESOURCES_PATH, "config-duplicate-local-paths.yaml"),
            summary=None,
            force=False,
            insecure=False,
            github_token="dummy_token",
        )
        with self.assertRaisesRegex(BmycError, "Duplicate local paths found for assets: package1.asset1, package1.asset2, package1.asset3, package2.asset1"):
            Processor(cli_context)

    @patch("bmyc.processor.ResultsHandler")
    @patch("bmyc.processor.asyncio.run")
    def test_process_should_execute_successfully_with_json_configuration_and_write_config(self, mock_asyncio_run, mock_results_handler_class):
        def mock_asyncio_run_impl(coro):
            coro.close()
            return None

        mock_asyncio_run.side_effect = mock_asyncio_run_impl
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_config_path = Path(temp_dir, "config.json")
            temp_config_path.write_text(Path(MODEL_RESOURCES_PATH, "config-valid.json").read_text())
            cli_context = dummy_cli_context()
            cli_context.configuration = temp_config_path
            processor = Processor(cli_context)
            processor.process()
            mock_asyncio_run.assert_called_once()
            assert temp_config_path.exists()
            written_content = json.loads(temp_config_path.read_text())
            assert "multi_package" in written_content
            mock_results_handler_instance = mock_results_handler_class.return_value
            mock_results_handler_instance.print_results.assert_called_once()

    @patch("bmyc.processor.ResultsHandler")
    @patch("bmyc.processor.asyncio.run")
    def test_process_should_execute_successfully_with_yaml_configuration_and_write_config(self, mock_asyncio_run, mock_results_handler_class):
        def mock_asyncio_run_impl(coro):
            coro.close()
            return None

        mock_asyncio_run.side_effect = mock_asyncio_run_impl
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_config_path = Path(temp_dir, "config.yaml")
            temp_config_path.write_text(Path(MODEL_RESOURCES_PATH, "config-valid.yaml").read_text())
            cli_context = dummy_cli_context()
            cli_context.configuration = temp_config_path
            processor = Processor(cli_context)
            processor.process()
            mock_asyncio_run.assert_called_once()
            assert temp_config_path.exists()
            written_content = temp_config_path.read_text()
            assert "multi_package" in written_content
            mock_results_handler_instance = mock_results_handler_class.return_value
            mock_results_handler_instance.print_results.assert_called_once()

    @patch("bmyc.processor.ResultsHandler")
    @patch("bmyc.processor.asyncio.run")
    def test_process_should_save_summary_when_summary_path_is_provided(self, mock_asyncio_run, mock_results_handler_class):
        def mock_asyncio_run_impl(coro):
            coro.close()
            return None

        mock_asyncio_run.side_effect = mock_asyncio_run_impl
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_config_path = Path(temp_dir, "config.json")
            temp_summary_path = Path(temp_dir, "summary.json")
            temp_config_path.write_text(Path(MODEL_RESOURCES_PATH, "config-valid.json").read_text())
            cli_context = dummy_cli_context()
            cli_context.configuration = temp_config_path
            cli_context.summary = temp_summary_path
            processor = Processor(cli_context)
            processor.process()
            mock_results_handler_instance = mock_results_handler_class.return_value
            mock_results_handler_instance.save_summary.assert_called_once_with(temp_summary_path)

    @patch("bmyc.processor.ResultsHandler")
    @patch("bmyc.processor.asyncio.run")
    def test_process_should_not_save_summary_when_summary_path_is_none(self, mock_asyncio_run, mock_results_handler_class):
        def mock_asyncio_run_impl(coro):
            coro.close()
            return None

        mock_asyncio_run.side_effect = mock_asyncio_run_impl
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_config_path = Path(temp_dir, "config.json")
            temp_config_path.write_text(Path(MODEL_RESOURCES_PATH, "config-valid.json").read_text())
            cli_context = dummy_cli_context()
            cli_context.configuration = temp_config_path
            processor = Processor(cli_context)
            processor.process()
            mock_results_handler_instance = mock_results_handler_class.return_value
            mock_results_handler_instance.save_summary.assert_called_once_with(None)

    @patch("bmyc.processor.ResultsHandler")
    @patch("bmyc.processor.asyncio.run")
    def test_process_configuration_is_awaited_during_process(self, mock_asyncio_run, _mock_results_handler_class):
        def mock_asyncio_run_impl(coro):
            coro.close()
            return None

        mock_asyncio_run.side_effect = mock_asyncio_run_impl
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_config_path = Path(temp_dir, "config.json")
            temp_config_path.write_text(Path(MODEL_RESOURCES_PATH, "config-valid.json").read_text())
            cli_context = dummy_cli_context()
            cli_context.configuration = temp_config_path
            processor = Processor(cli_context)
            processor.process()
            mock_asyncio_run.assert_called_once()

    @patch("bmyc.model.asset.Asset.bump_to_latest_version", new_callable=AsyncMock)
    def test_process_configuration_calls_bump_to_latest_version_for_each_asset(self, mock_bump_to_latest_version):
        cli_context = dummy_cli_context()
        processor = Processor(cli_context)
        bmyc_configuration = getattr(processor, "_Processor__bmyc_configuration")
        total_assets = sum(len(package.assets) for package in bmyc_configuration.packages.values())
        asyncio.run(getattr(processor, "_Processor__process_configuration")())
        assert mock_bump_to_latest_version.call_count == total_assets
        assert total_assets > 0

    @patch("bmyc.model.asset.Asset.bump_to_latest_version", new_callable=AsyncMock)
    def test_process_configuration_passes_cli_context_to_assets(self, mock_bump_to_latest_version):
        cli_context = dummy_cli_context()
        processor = Processor(cli_context)
        bmyc_configuration = getattr(processor, "_Processor__bmyc_configuration")
        total_assets = sum(len(package.assets) for package in bmyc_configuration.packages.values())
        asyncio.run(getattr(processor, "_Processor__process_configuration")())
        assert mock_bump_to_latest_version.call_count == total_assets
        for call_args in mock_bump_to_latest_version.call_args_list:
            assert len(call_args.args) >= 1
            assert isinstance(call_args.args[0], CliContext)

    @patch("bmyc.model.asset.Asset.bump_to_latest_version", new_callable=AsyncMock)
    def test_process_configuration_processes_all_assets(self, mock_bump_to_latest_version):
        cli_context = dummy_cli_context()
        processor = Processor(cli_context)
        packages = getattr(processor, "_Processor__bmyc_configuration").packages
        assert "multi_package" in packages
        total_assets = sum(len(package.assets) for package in packages.values())
        asyncio.run(getattr(processor, "_Processor__process_configuration")())
        assert mock_bump_to_latest_version.call_count == total_assets

    @patch("bmyc.model.asset.Asset.bump_to_latest_version", new_callable=AsyncMock)
    def test_process_configuration_uses_asyncio_gather(self, mock_bump_to_latest_version):
        cli_context = dummy_cli_context()
        processor = Processor(cli_context)
        bmyc_configuration = getattr(processor, "_Processor__bmyc_configuration")
        total_assets = sum(len(package.assets) for package in bmyc_configuration.packages.values())
        asyncio.run(getattr(processor, "_Processor__process_configuration")())
        assert mock_bump_to_latest_version.call_count == total_assets
        assert mock_bump_to_latest_version.await_count == total_assets
