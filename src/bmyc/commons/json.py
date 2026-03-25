import json
from pathlib import Path
from typing import Any, Type

from jsonschema import validate

from bmyc.commons.bmyc_error import BmycError
from bmyc.commons.common_constants import T


def to_json(file_path: Path) -> dict:
    """Reads a JSON file and returns its contents as a dictionary.

    Parameters
    ----------
    file_path : Path
        JSON file path.

    Returns
    -------
    dict
        Parsed JSON content.

    Raises
    ------
    FileNotFoundError
        If the file does not exist.
    json.JSONDecodeError
        If the file content is not a valid JSON.
    BmycError
        If there's an issue reading the file.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}.")
    try:
        return json.load(Path.open(file_path))
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(f"Invalid JSON file {file_path}: {e.msg}.", e.doc, e.pos)
    except Exception as e:
        raise BmycError(f"Error reading file {file_path}: {e}.")


def to_pretty_json(input_json: Any, indent: int = 4) -> str:
    """Formats a JSON dictionary into a pretty-printed string.

    Parameters
    ----------
    input_json : Any
        JSON dictionary.

    Returns
    -------
    str
        Pretty-printed JSON string.
    """
    return json.dumps(input_json, indent=indent, default=str)


def to_json_object(file_path: Path, schema: dict, obj_type: Type[T]) -> T:
    """Parses JSON file as an object.

    Parameters
    ----------
    file_path : Path
        JSON file path.
    schema : dict
        JSON schema.
    obj_type : Type[T]
        Object type to instantiate from the parsed JSON.

    Returns
    -------
    T
        Instance of `obj_type`.

    Raises
    ------
    BmycError
        If JSON validation fails.
    """
    try:
        configuration = to_json(file_path)
        validate(instance=configuration, schema=schema)
        return obj_type(**configuration)
    except Exception as e:
        raise BmycError(f"JSON validation error: {e}.")


def update_dictionary(dictionnary: Any, placeholder: str, replacement_string: str) -> Any:
    """Recursively replaces all occurrences of a placeholder in string values of a dictionary.

    Parameters
    ----------
    dictionnary : dict
        Input dictionary.
    placeholder : str
        Placeholder string to replace.
    replacement_string : str
        Value to set as replacement in placeholder.

    Returns
    -------
    dict
        Updated dictionary.
    """
    if isinstance(dictionnary, dict):
        return {k: update_dictionary(v, placeholder, replacement_string) for k, v in dictionnary.items()}
    elif isinstance(dictionnary, list):
        return [update_dictionary(item, placeholder, replacement_string) for item in dictionnary]
    elif isinstance(dictionnary, str):
        return dictionnary.replace(placeholder, replacement_string)
    else:
        return dictionnary
