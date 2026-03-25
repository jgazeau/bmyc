import unittest
from pathlib import Path

from bmyc.commons.json import to_json
from bmyc.commons.yaml import to_yaml
from bmyc.model.bmyc_configuration import BmycConfiguration
from tests.commons.helpers import MODEL_RESOURCES_PATH


class TestBmycConfiguration(unittest.TestCase):
    def test_bmyc_configuration_should_be_valid_when_json_is_provided(self):
        bmyc_configuration = BmycConfiguration.model_validate(to_json(Path(MODEL_RESOURCES_PATH, "config-valid.json")))
        for package_name, package in bmyc_configuration.packages.items():
            assert package.name == package_name
            for asset_name, asset in package.assets.items():
                assert asset.package_name == package_name
                assert asset.name == asset_name
        assert isinstance(bmyc_configuration, BmycConfiguration)

    def test_bmyc_configuration_should_be_valid_when_yaml_is_provided(self):
        bmyc_configuration = BmycConfiguration.model_validate(to_yaml(Path(MODEL_RESOURCES_PATH, "config-valid.yaml")))
        for package_name, package in bmyc_configuration.packages.items():
            assert package.name == package_name
            for asset_name, asset in package.assets.items():
                assert asset.package_name == package_name
                assert asset.name == asset_name
        assert isinstance(bmyc_configuration, BmycConfiguration)

    def test_bmyc_configuration_should_be_invalid_when_json_hold_without_current_version(self):
        with self.assertRaisesRegex(ValueError, "current_version must be set when hold is True"):
            BmycConfiguration.model_validate(to_json(Path(MODEL_RESOURCES_PATH, "config-invalid-hold.json")))

    def test_bmyc_configuration_should_be_invalid_when_yaml_hold_without_current_version(self):
        with self.assertRaisesRegex(ValueError, "current_version must be set when hold is True"):
            BmycConfiguration.model_validate(to_yaml(Path(MODEL_RESOURCES_PATH, "config-invalid-hold.yaml")))

    def test_bmyc_configuration_should_be_invalid_when_json_unknown_provider(self):
        with self.assertRaisesRegex(ValueError, "No provider found. Expected one of: cdnjs, github, jsdelivr, unpkg."):
            BmycConfiguration.model_validate(to_json(Path(MODEL_RESOURCES_PATH, "config-invalid-provider.json")))

    def test_bmyc_configuration_should_be_invalid_when_yaml_unknown_provider(self):
        with self.assertRaisesRegex(ValueError, "No provider found. Expected one of: cdnjs, github, jsdelivr, unpkg."):
            BmycConfiguration.model_validate(to_yaml(Path(MODEL_RESOURCES_PATH, "config-invalid-provider.yaml")))
