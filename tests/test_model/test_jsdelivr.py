import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from bmyc.commons.bmyc_error import BmycError
from bmyc.model.providers.jsdelivr import Jsdelivr
from tests.commons.helpers import dummy_cli_context


class TestJsdelivr(unittest.TestCase):
    def test_jsdelivr_should_implement_get_latest_version(self):
        assert hasattr(Jsdelivr, "get_latest_version")

    def test_jsdelivr_should_implement_save_content(self):
        assert hasattr(Jsdelivr, "save_content")

    @patch("requests.get")
    def test_jsdelivr_get_latest_version_should_return_latest_version(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.json.return_value = {"tags": {"latest": "1.0.0"}}
        mock_response.raise_for_status.return_value = None
        jsdelivr = Jsdelivr(cdn="test-cdn", package="test-package", file_path=Path("path/test-file.js"))
        self.assertEqual(jsdelivr.get_latest_version(dummy_cli_context()), "1.0.0")

    @patch("requests.get")
    def test_jsdelivr_get_latest_version_should_raise_bmyc_error_when_version_not_found(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.json.return_value = {"unknown_field": "1.0.0"}
        mock_response.raise_for_status.return_value = None
        jsdelivr = Jsdelivr(cdn="test-cdn", package="test-package", file_path=Path("path/test-file.js"))
        with self.assertRaises(BmycError):
            jsdelivr.get_latest_version(dummy_cli_context())

    @patch("requests.get")
    def test_jsdelivr_get_latest_version_should_raise_bmyc_error_when_request_fails(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.raise_for_status.side_effect = Exception("Error")
        jsdelivr = Jsdelivr(cdn="test-cdn", package="test-package", file_path=Path("path/test-file.js"))
        with self.assertRaises(BmycError):
            jsdelivr.get_latest_version(dummy_cli_context())

    @patch("requests.get")
    def test_jsdelivr_save_content_should_save_content(self, mock_get):
        with tempfile.TemporaryDirectory() as temp_dir:
            test_file_path = Path(temp_dir, "subdir", "test-file.js")
            test_file_content_bytes = b"test content"
            mock_response = mock_get.return_value
            mock_response.raise_for_status.return_value = None
            mock_response.iter_content.return_value = [test_file_content_bytes]
            jsdelivr = Jsdelivr(cdn="test-cdn", package="test-package", file_path=Path("path/test-file.js"))
            jsdelivr.save_content(dummy_cli_context(), "1.0.0", test_file_path)
            self.assertEqual(test_file_path.read_bytes(), test_file_content_bytes)

    @patch("requests.get")
    def test_jsdelivr_save_content_should_raise_bmyc_error_when_request_fails(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.raise_for_status.side_effect = Exception("Error")
        jsdelivr = Jsdelivr(cdn="test-cdn", package="test-package", file_path=Path("path/test-file.js"))
        with self.assertRaises(BmycError):
            jsdelivr.save_content(dummy_cli_context(), "1.0.0", Path("path/to/save"))
