import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from bmyc.commons.bmyc_error import BmycError
from bmyc.model.providers.unpkg import Unpkg
from tests.commons.helpers import dummy_cli_context


class TestUnpkg(unittest.TestCase):
    def test_unpkg_should_implement_get_latest_version(self):
        assert hasattr(Unpkg, "get_latest_version")

    def test_unpkg_should_implement_save_content(self):
        assert hasattr(Unpkg, "save_content")

    @patch("requests.get")
    def test_unpkg_get_latest_version_should_return_latest_version(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.url = "https://unpkg.com/test-library@1.0.0/"
        mock_response.raise_for_status.return_value = None
        unpkg = Unpkg(library="test-library", file_path=Path("path/test-file.js"))
        self.assertEqual(unpkg.get_latest_version(dummy_cli_context()), "1.0.0")

    @patch("requests.get")
    def test_unpkg_get_latest_version_should_raise_bmyc_error_when_version_not_found(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.url = "https://unpkg.com/test-library/"
        mock_response.raise_for_status.return_value = None
        unpkg = Unpkg(library="test-library", file_path=Path("path/test-file.js"))
        with self.assertRaises(BmycError):
            unpkg.get_latest_version(dummy_cli_context())

    @patch("requests.get")
    def test_unpkg_get_latest_version_should_raise_bmyc_error_when_request_fails(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.raise_for_status.side_effect = Exception("Error")
        unpkg = Unpkg(library="test-library", file_path=Path("path/test-file.js"))
        with self.assertRaises(BmycError):
            unpkg.get_latest_version(dummy_cli_context())

    @patch("requests.get")
    def test_unpkg_save_content_should_save_content(self, mock_get):
        with tempfile.TemporaryDirectory() as temp_dir:
            test_file_path = Path(temp_dir, "subdir", "test-file.js")
            test_file_content_bytes = b"test content"
            mock_response = mock_get.return_value
            mock_response.raise_for_status.return_value = None
            mock_response.iter_content.return_value = [test_file_content_bytes]
            unpkg = Unpkg(library="test-library", file_path=Path("path/test-file.js"))
            unpkg.save_content(dummy_cli_context(), "1.0.0", test_file_path)
            self.assertEqual(test_file_path.read_bytes(), test_file_content_bytes)

    @patch("requests.get")
    def test_unpkg_save_content_should_raise_bmyc_error_when_request_fails(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.raise_for_status.side_effect = Exception("Error")
        unpkg = Unpkg(library="test-library", file_path=Path("path/test-file.js"))
        with self.assertRaises(BmycError):
            unpkg.save_content(dummy_cli_context(), "1.0.0", Path("path/to/save"))
