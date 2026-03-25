import unittest

from bmyc.model.providers.provider import get_supported_providers


class TestProvider(unittest.TestCase):
    def test_get_supported_providers_should_return_all_providers_when_called(self):
        result = get_supported_providers()
        self.assertEqual(result, "cdnjs, github, jsdelivr, unpkg")
