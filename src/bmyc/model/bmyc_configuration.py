from typing import Dict, Self

from pydantic import RootModel, model_validator

from bmyc.model.package import Package


class BmycConfiguration(RootModel):
    root: Dict[str, Package]

    @property
    def packages(self) -> Dict[str, Package]:
        return self.root

    @model_validator(mode="after")
    def add_packages_names(self) -> Self:
        for package_name, package in self.root.items():
            package.name = package_name
            for _, asset in package.assets.items():
                asset.package_name = package_name
        return self
