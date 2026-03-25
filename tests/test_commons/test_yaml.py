import unittest
from pathlib import Path
from unittest.mock import patch

from pydantic import BaseModel
from yaml import YAMLError

from bmyc.commons.bmyc_error import BmycError
from bmyc.commons.yaml import to_yaml, to_yaml_object
from tests.commons.helpers import COMMONS_RESOURCES_PATH


class TestYaml(unittest.TestCase):
    def test_to_yaml_should_read_yaml(self):
        yaml = to_yaml(Path(COMMONS_RESOURCES_PATH, "dummy.yaml"))
        assert type(yaml) is dict
        assert "key" in yaml
        assert yaml["key"] == "value"

    def test_to_yaml_should_fail_when_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            to_yaml(Path(COMMONS_RESOURCES_PATH, "non_existent.yaml"))

    def test_to_yaml_should_fail_when_invalid_yaml(self):
        with self.assertRaises(YAMLError):
            to_yaml(Path(COMMONS_RESOURCES_PATH, "dummy-invalid.yaml"))

    def test_to_yaml_object_should_parse_json_to_object(self):
        class DummyObject(BaseModel):
            key: str

        DUMMY_SCHEMA = {"key": {"type": "string"}}
        dummy_object = to_yaml_object(Path(COMMONS_RESOURCES_PATH, "dummy.yaml"), DUMMY_SCHEMA, DummyObject)
        assert type(dummy_object) is DummyObject
        assert dummy_object.key == "value"

    def test_to_yaml_object_should_fail_when_invalid_yaml(self):
        class DummyObject(BaseModel):
            unknown_key: str

        with self.assertRaises(BmycError):
            to_yaml_object(Path(COMMONS_RESOURCES_PATH, "dummy.yaml"), {}, DummyObject)

    @patch("pathlib.Path.open")
    def test_to_yaml_should_raise_bmyc_error_when_exception_occurs(self, mock_file_open):
        mock_file_open.side_effect = IOError("Mocked IO error")
        with self.assertRaises(BmycError):
            to_yaml(Path(COMMONS_RESOURCES_PATH, "dummy.yaml"))
