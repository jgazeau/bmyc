from pathlib import Path
from typing import Type

from pydantic import BaseModel

from bmyc.commons.common_constants import JSON_EXTENSIONS, YAML_EXTENSIONS
from bmyc.commons.json import to_json
from bmyc.commons.yaml import to_yaml


def get_field_name_from_alias(model: Type[BaseModel], alias: str) -> str:
    for name, field in model.model_fields.items():
        if field.alias == alias:
            return name
    raise ValueError(f"No field with alias '{alias}' found in model '{model.__name__}'")


def to_dto(file_path: Path) -> dict:
    if file_path.suffix in JSON_EXTENSIONS:
        return to_json(file_path)
    elif file_path.suffix in YAML_EXTENSIONS:
        return to_yaml(file_path)
    else:
        raise ValueError(f"Unsupported configuration file extension: {file_path.suffix}")
