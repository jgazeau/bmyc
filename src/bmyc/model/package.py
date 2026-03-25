from typing import Dict, Self

from pydantic import PrivateAttr, RootModel, model_validator

from bmyc.model.asset import Asset


class Package(RootModel):
    root: Dict[str, Asset]
    _name: str = PrivateAttr(default="")

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str):
        self._name = value

    @property
    def assets(self) -> Dict[str, Asset]:
        return self.root

    @model_validator(mode="after")
    def add_assets_names(self) -> Self:
        for asset_name, asset in self.root.items():
            asset.name = asset_name
        return self
