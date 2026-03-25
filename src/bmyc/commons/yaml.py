from pathlib import Path
from typing import Type

import yaml
from jsonschema import validate

from bmyc.commons.bmyc_error import BmycError
from bmyc.commons.common_constants import T


def to_yaml(file_path: Path) -> dict:
    """Read a JSON file and returns its contents as a dictionary.

    Parameters
    ----------
    file_path : Path
        YAML file path.

    Returns
    -------
    dict
        Parsed YAML content.

    Raises
    ------
    FileNotFoundError
        If the file does not exist.
    yaml.YAMLError
        If the file content is not a valid YAML.
    BmycError
        If there's an issue reading the file.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    try:
        return yaml.safe_load(Path.open(file_path))
    except yaml.YAMLError as e:
        raise yaml.YAMLError(f"Invalid YAML file {file_path}: {e}.")
    except Exception as e:
        raise BmycError(f"Error reading file {file_path}: {e}.")


def to_yaml_object(file_path: Path, schema: dict, obj_type: Type[T]) -> T:
    """Parses YAML file as an object.

    Parameters
    ----------
    file_path : Path
        YAML file path.
    schema : dict
        JSON schema.
    obj_type : Type[T]
        Object type to instantiate from the parsed YAML.

    Returns
    -------
    T
        Instance of `obj_type`.

    Raises
    ------
    BmycError
        If YAML validation fails.
    """
    try:
        configuration = to_yaml(file_path)
        validate(instance=configuration, schema=schema)
        return obj_type(**configuration)
    except Exception as e:
        raise BmycError(f"YAML validation error: {e}.")
