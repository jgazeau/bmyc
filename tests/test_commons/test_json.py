import json
import unittest
from pathlib import Path
from unittest.mock import patch

from pydantic import BaseModel

from bmyc.commons.bmyc_error import BmycError
from bmyc.commons.json import to_json, to_json_object, to_pretty_json, update_dictionary
from tests.commons.helpers import COMMONS_RESOURCES_PATH


class TestJson(unittest.TestCase):
    def test_to_json_should_read_json(self):
        json = to_json(Path(COMMONS_RESOURCES_PATH, "dummy.json"))
        assert type(json) is dict
        assert "key" in json
        assert json["key"] == "value"

    def test_to_json_should_fail_when_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            to_json(Path(COMMONS_RESOURCES_PATH, "non_existent.json"))

    def test_to_json_should_fail_when_invalid_json(self):
        with self.assertRaises(json.JSONDecodeError):
            to_json(Path(COMMONS_RESOURCES_PATH, "dummy-invalid.json"))

    def test_to_pretty_json_should_pretty_print_json(self):
        json = to_pretty_json(to_json(Path(COMMONS_RESOURCES_PATH, "dummy.json")))
        assert type(json) is str
        assert json == """{\n    "key": "value"\n}"""

    def test_to_json_object_should_parse_json_to_object(self):
        class DummyObject(BaseModel):
            key: str

        DUMMY_SCHEMA = {"key": {"type": "string"}}
        dummy_object = to_json_object(Path(COMMONS_RESOURCES_PATH, "dummy.json"), DUMMY_SCHEMA, DummyObject)
        assert type(dummy_object) is DummyObject
        assert dummy_object.key == "value"

    def test_to_json_object_should_fail_when_invalid_json(self):
        class DummyObject(BaseModel):
            unknown_key: str

        with self.assertRaises(BmycError):
            to_json_object(Path(COMMONS_RESOURCES_PATH, "dummy.json"), {}, DummyObject)

    def test_update_dictionary_should_update_dictionary(self):
        TEST_SCHEMA = {
            "string_value": "[TEST]_STRING",
            "nested_dict": {"key1": "[TEST]_NESTED", "key2": {"deep_key": "[TEST]_DEEP"}},
            "list_of_strings": ["[TEST]_LIST_1", "[TEST]_LIST_2"],
            "list_of_dicts": [{"key": "[TEST]_LIST_OBJ_1"}, {"key": "[TEST]_LIST_OBJ_2"}],
            "mixed_types": {"integer_value": 42, "boolean_value": True, "null_value": None, "float_value": 3.14},
        }
        expected_output = {
            "string_value": "REPLACEMENT_STRING_STRING",
            "nested_dict": {"key1": "REPLACEMENT_STRING_NESTED", "key2": {"deep_key": "REPLACEMENT_STRING_DEEP"}},
            "list_of_strings": ["REPLACEMENT_STRING_LIST_1", "REPLACEMENT_STRING_LIST_2"],
            "list_of_dicts": [{"key": "REPLACEMENT_STRING_LIST_OBJ_1"}, {"key": "REPLACEMENT_STRING_LIST_OBJ_2"}],
            "mixed_types": {"integer_value": 42, "boolean_value": True, "null_value": None, "float_value": 3.14},
        }
        result = update_dictionary(TEST_SCHEMA, "[TEST]", "REPLACEMENT_STRING")
        assert result == expected_output

    @patch("pathlib.Path.open")
    def test_to_json_should_raise_bmyc_error_when_exception_occurs(self, mock_file_open):
        mock_file_open.side_effect = IOError("Mocked IO error")
        with self.assertRaises(BmycError):
            to_json(Path(COMMONS_RESOURCES_PATH, "dummy.json"))
