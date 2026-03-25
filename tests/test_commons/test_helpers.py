import unittest
from pathlib import Path

from pydantic import BaseModel, Field

from bmyc.commons.helpers import get_field_name_from_alias, to_dto
from tests.commons.helpers import COMMONS_RESOURCES_PATH


class TestHelpers(unittest.TestCase):
    def test_get_field_name_from_alias_should_return_field_name(self):
        class DummyModel(BaseModel):
            field1: str = Field(..., alias="alias1")
            field2: int = Field(..., alias="alias2")

        assert get_field_name_from_alias(DummyModel, "alias1") == "field1"
        assert get_field_name_from_alias(DummyModel, "alias2") == "field2"

    def test_get_field_name_from_alias_should_raise_error_when_alias_is_invalid(self):
        class DummyModel(BaseModel):
            field1: str = Field(..., alias="alias1")

        with self.assertRaises(ValueError) as context:
            get_field_name_from_alias(DummyModel, "non_existent_alias")
        assert "No field with alias 'non_existent_alias' found in model 'DummyModel'" in str(context.exception)

    def test_to_dto_should_read_json(self):
        dto = to_dto(Path(COMMONS_RESOURCES_PATH, "dummy.json"))
        assert type(dto) is dict
        assert "key" in dto
        assert dto["key"] == "value"

    def test_to_dto_should_read_yaml(self):
        dto = to_dto(Path(COMMONS_RESOURCES_PATH, "dummy.yaml"))
        assert type(dto) is dict
        assert "key" in dto
        assert dto["key"] == "value"

    def test_to_dto_should_fail_when_extension_is_unsupported(self):
        with self.assertRaises(ValueError) as context:
            to_dto(Path(COMMONS_RESOURCES_PATH, "dummy.txt"))
        assert "Unsupported configuration file extension: .txt" in str(context.exception)
