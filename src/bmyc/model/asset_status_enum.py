from enum import Enum


class AssetStatusEnum(str, Enum):
    ERROR = "Error"
    OUTDATED = "Outdated"
    UPDATED = "Updated"
    UP_TO_DATE = "Up to Date"
