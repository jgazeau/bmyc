import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from bmyc.model.asset_status_enum import AssetStatusEnum
from bmyc.results_handler import ResultsHandler


class TestResultsHandler(unittest.TestCase):
    def setUp(self):
        ResultsHandler.clear()

    def tearDown(self):
        ResultsHandler.clear()

    def _add_one_of_each(self, handler: ResultsHandler):
        handler.add_result("pkg", "asset_error", "1.0.0", False, AssetStatusEnum.ERROR, "some error")
        handler.add_result("pkg", "asset_outdated", "1.0.0", False, AssetStatusEnum.OUTDATED, "")
        handler.add_result("pkg", "asset_updated", "2.0.0", False, AssetStatusEnum.UPDATED, "/path/to/file")
        handler.add_result("pkg", "asset_up_to_date", "2.0.0", True, AssetStatusEnum.UP_TO_DATE, "/path/to/file")

    def test_results_handler_should_return_same_instance_when_instantiated_multiple_times(self):
        handler1 = ResultsHandler()
        handler2 = ResultsHandler()
        assert handler1 is handler2

    def test_results_handler_should_have_zero_counters_when_initialized(self):
        handler = ResultsHandler()
        assert handler.error == 0
        assert handler.outdated == 0
        assert handler.updated == 0
        assert handler.up_to_date == 0

    def test_results_handler_should_have_empty_results_when_initialized(self):
        handler = ResultsHandler()
        assert handler._results == []

    def test_add_result_should_increment_error_counter_when_error_status(self):
        handler = ResultsHandler()
        handler.add_result("pkg", "asset", "1.0.0", False, AssetStatusEnum.ERROR, "err")
        assert handler.error == 1
        assert handler.outdated == 0
        assert handler.updated == 0
        assert handler.up_to_date == 0

    def test_add_result_should_increment_outdated_counter_when_outdated_status(self):
        handler = ResultsHandler()
        handler.add_result("pkg", "asset", "1.0.0", False, AssetStatusEnum.OUTDATED, "")
        assert handler.error == 0
        assert handler.outdated == 1
        assert handler.updated == 0
        assert handler.up_to_date == 0

    def test_add_result_should_increment_updated_counter_when_updated_status(self):
        handler = ResultsHandler()
        handler.add_result("pkg", "asset", "2.0.0", False, AssetStatusEnum.UPDATED, "/path")
        assert handler.error == 0
        assert handler.outdated == 0
        assert handler.updated == 1
        assert handler.up_to_date == 0

    def test_add_result_should_increment_up_to_date_counter_when_up_to_date_status(self):
        handler = ResultsHandler()
        handler.add_result("pkg", "asset", "2.0.0", True, AssetStatusEnum.UP_TO_DATE, "/path")
        assert handler.error == 0
        assert handler.outdated == 0
        assert handler.updated == 0
        assert handler.up_to_date == 1

    def test_add_result_should_append_to_results_when_result_added(self):
        handler = ResultsHandler()
        handler.add_result("pkg", "asset", "1.0.0", False, AssetStatusEnum.ERROR, "err")
        assert len(handler._results) == 1
        assert handler._results[0] == ("pkg", "asset", "1.0.0", False, AssetStatusEnum.ERROR.value, "err")

    def test_add_result_should_accumulate_when_multiple_results_added(self):
        handler = ResultsHandler()
        self._add_one_of_each(handler)
        assert handler.error == 1
        assert handler.outdated == 1
        assert handler.updated == 1
        assert handler.up_to_date == 1
        assert len(handler._results) == 4

    def test_get_results_table_should_have_correct_columns_when_called(self):
        handler = ResultsHandler()
        table = handler._get_results_table()
        assert table.field_names == ["Package", "Name", "Version", "Hold", "Status", "Local Path/Error"]

    def test_get_results_table_should_contain_added_rows_when_rows_added(self):
        handler = ResultsHandler()
        handler.add_result("mypkg", "myasset", "3.0.0", True, AssetStatusEnum.UPDATED, "/some/path")
        table = handler._get_results_table()
        assert len(table.rows) == 1
        assert table.rows[0] == ["mypkg", "myasset", "3.0.0", True, AssetStatusEnum.UPDATED.value, "/some/path"]

    def test_get_totals_table_should_have_correct_columns_when_called(self):
        handler = ResultsHandler()
        table = handler._get_totals_table()
        assert table.field_names == ["Total", "Count"]

    def test_get_totals_table_should_reflect_counters_when_results_added(self):
        handler = ResultsHandler()
        self._add_one_of_each(handler)
        table = handler._get_totals_table()
        rows = {row[0]: row[1] for row in table.rows}
        assert rows["Error"] == 1
        assert rows["Outdated"] == 1
        assert rows["Updated"] == 1
        assert rows["Up-to-date"] == 1

    def test_print_results_should_log_tables_when_called(self):
        handler = ResultsHandler()
        self._add_one_of_each(handler)
        with patch("bmyc.results_handler.logging") as mock_logging:
            handler.print_results()
            mock_logging.info.assert_called_once()
            logged_message = mock_logging.info.call_args[0][0]
            assert "Package" in logged_message
            assert "Total" in logged_message

    def test_save_summary_should_write_markdown_to_file_when_called(self):
        handler = ResultsHandler()
        self._add_one_of_each(handler)
        with tempfile.TemporaryDirectory() as tmp_dir:
            summary_path = Path(tmp_dir, "summary.md")
            handler.save_summary(summary_path)
            content = summary_path.read_text()
            assert "Package" in content
            assert "Total" in content
            assert "|" in content

    def test_save_summary_should_contain_all_statuses_when_file_saved(self):
        handler = ResultsHandler()
        self._add_one_of_each(handler)
        with tempfile.TemporaryDirectory() as tmp_dir:
            summary_path = Path(tmp_dir, "summary.md")
            handler.save_summary(summary_path)
            content = summary_path.read_text()
            assert AssetStatusEnum.ERROR.value in content
            assert AssetStatusEnum.OUTDATED.value in content
            assert AssetStatusEnum.UPDATED.value in content
            assert AssetStatusEnum.UP_TO_DATE.value in content
