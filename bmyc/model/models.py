from typing import List, Union, Literal, Optional
from pydantic import BaseModel, Field, RootModel

class CdnjsAssetManager(BaseModel):
    name: Literal["cdnjs"]
    library: str
    file_name: str = Field(alias="fileName")

class GithubAssetManager(BaseModel):
    name: Literal["github"]
    owner: str
    repository: str
    file_path: str = Field(alias="filePath")

class UnpkgAssetManager(BaseModel):
    name: Literal["unpkg"]
    library: str
    file_path: str = Field(alias="filePath")

class JsdelivrAssetManager(BaseModel):
    name: Literal["jsdelivr"]
    cdn: str
    package: str
    file_path: str = Field(alias="filePath")

class Asset(BaseModel):
    package: str
    hold: bool = False
    name: str
    local_path: str = Field(alias="localPath")
    current_version: Optional[str] = Field(alias="currentVersion")
    asset_manager: Union[
        CdnjsAssetManager,
        GithubAssetManager,
        UnpkgAssetManager,
        JsdelivrAssetManager,
    ] = Field(alias="assetManager")

class Configuration(RootModel):
    root: List[Asset]
