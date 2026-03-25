import logging

import pytest

from bmyc.commons.common_constants import MAX_TTY_LENGTH
from bmyc.commons.logging import log_horizontal_rule, log_title


class TestLogging:
    def test_log_horizontal_rule_should_log_rule_when_called(self, caplog: pytest.LogCaptureFixture):
        char_rule = "*"
        with caplog.at_level(logging.INFO):
            log_horizontal_rule(char_rule)
        assert len(caplog.records) == 1
        assert caplog.records[0].message == char_rule * MAX_TTY_LENGTH

    def test_log_title_should_use_default_char_when_no_char_provided(self, caplog: pytest.LogCaptureFixture):
        char_rule = "-"
        title = "Hello World"
        centered_title = f" {title} ".center(MAX_TTY_LENGTH, char_rule)
        with caplog.at_level(logging.INFO):
            log_title(title)
        assert len(caplog.records) == 3
        assert caplog.messages == [char_rule * MAX_TTY_LENGTH, centered_title, char_rule * MAX_TTY_LENGTH]

    @pytest.mark.parametrize("char_rule", ["*", "#", "~"])
    def test_log_title_should_use_custom_char_when_char_provided(self, caplog: pytest.LogCaptureFixture, char_rule):
        title = "Hello World"
        centered_title = f" {title} ".center(MAX_TTY_LENGTH, char_rule)
        with caplog.at_level(logging.INFO):
            log_title(title, char_rule)
        assert caplog.messages == [char_rule * MAX_TTY_LENGTH, centered_title, char_rule * MAX_TTY_LENGTH]
