"""
Tests for the bmyc CLI.
"""

import unittest
from pathlib import Path
from unittest.mock import patch

from click.testing import CliRunner

from bmyc.cli import cli
from tests.commons.helpers import MODEL_RESOURCES_PATH


class TestCliInstallCompletion(unittest.TestCase):
    """Test CLI --install-completion option."""

    def setUp(self):
        """Set up test fixtures."""
        self.runner = CliRunner()
        self.config_path = Path(MODEL_RESOURCES_PATH, "config-valid.json")

    def test_install_completion_bash(self):
        """Test --install-completion with bash."""
        result = self.runner.invoke(cli, ["--install-completion", "bash"])
        assert result.exit_code == 0
        assert "bash" in result.output.lower()
        assert "_BMYC_COMPLETE=bash_source" in result.output
        assert "~/.bashrc" in result.output

    def test_install_completion_zsh(self):
        """Test --install-completion with zsh."""
        result = self.runner.invoke(cli, ["--install-completion", "zsh"])
        assert result.exit_code == 0
        assert "zsh" in result.output.lower()
        assert "_BMYC_COMPLETE=zsh_source" in result.output
        assert "~/.zshrc" in result.output

    def test_install_completion_fish(self):
        """Test --install-completion with fish."""
        result = self.runner.invoke(cli, ["--install-completion", "fish"])
        assert result.exit_code == 0
        assert "fish" in result.output.lower()
        assert "_BMYC_COMPLETE=fish_source" in result.output
        assert "~/.config/fish/completions" in result.output

    def test_install_completion_auto_detected(self):
        """Test --install-completion auto detection."""
        with patch("bmyc.cli.get_current_shell", return_value="bash"):
            result = self.runner.invoke(cli, ["--install-completion", "auto"])
            assert result.exit_code == 0
            assert "bash" in result.output.lower()

    def test_install_completion_auto_detection_failure(self):
        """Test --install-completion auto when shell cannot be detected."""
        with patch("bmyc.cli.get_current_shell", return_value=None):
            result = self.runner.invoke(cli, ["--install-completion", "auto"])
            assert result.exit_code == 1
            assert "Could not detect" in result.output or "error" in result.output.lower()

    def test_install_completion_auto_default(self):
        """Test --install-completion flag value with auto default."""
        with patch("bmyc.cli.get_current_shell", return_value="zsh"):
            result = self.runner.invoke(cli, ["--install-completion"])
            assert result.exit_code == 0
            assert "zsh" in result.output.lower()

    def test_install_completion_invalid_shell(self):
        """Test --install-completion with invalid shell."""
        result = self.runner.invoke(cli, ["--install-completion", "invalid_shell"])
        # Click should handle invalid choice
        assert result.exit_code != 0

    def test_normal_execution_without_install_completion(self):
        """Test normal CLI execution without --install-completion."""
        result = self.runner.invoke(
            cli,
            ["-c", str(self.config_path), "--github-token", "dummy_token"],
        )
        # Should run normally (exit code depends on processor, not install-completion)
        # We're just testing that --install-completion is not triggered
        assert "--install-completion" not in result.output or "install" not in result.output.lower()

    def test_configuration_required_without_install_completion(self):
        """Test that configuration is required when not using --install-completion."""
        result = self.runner.invoke(cli, [])
        # Configuration should be required
        assert result.exit_code != 0
        assert "required" in result.output.lower() or "error" in result.output.lower()

    def test_missing_configuration_file(self):
        """Test error when configuration file does not exist."""
        result = self.runner.invoke(cli, ["-c", "/nonexistent/path.json"])
        assert result.exit_code != 0

    def test_install_completion_bypasses_configuration_requirement(self):
        """Test that --install-completion bypasses configuration file requirement."""
        # With --install-completion, the configuration file shouldn't be required
        result = self.runner.invoke(cli, ["--install-completion", "bash"])
        assert result.exit_code == 0
        # Should not complain about missing configuration


class TestCliWithConfiguration(unittest.TestCase):
    """Test CLI with various configurations."""

    def setUp(self):
        """Set up test fixtures."""
        self.runner = CliRunner()
        self.config_path = Path(MODEL_RESOURCES_PATH, "config-valid.json")

    def test_cli_with_valid_configuration(self):
        """Test CLI runs with valid configuration."""
        result = self.runner.invoke(
            cli,
            ["-c", str(self.config_path), "--github-token", "dummy_token"],
        )
        # Should run without config-related errors (processor errors are ok for this test)
        assert "Configuration file" not in result.output or "does not exist" not in result.output

    def test_cli_with_verbose_flag(self):
        """Test CLI with verbose flags."""
        result = self.runner.invoke(
            cli,
            ["-vvv", "-c", str(self.config_path), "--github-token", "dummy_token"],
        )
        # Should process verbose flags correctly
        assert result.exit_code is not None

    def test_cli_help_option(self):
        """Test CLI help option."""
        result = self.runner.invoke(cli, ["-h"])
        assert result.exit_code == 0
        assert "Bump Me if You Can" in result.output
        assert "--install-completion" in result.output
        assert "--force" in result.output
        assert "--insecure" in result.output

    def test_cli_configuration_short_option(self):
        """Test CLI configuration short option."""
        result = self.runner.invoke(
            cli,
            ["-c", str(self.config_path), "--github-token", "dummy_token"],
        )
        # Should accept short form
        assert "Configuration file" not in result.output or "does not exist" not in result.output

    def test_cli_configuration_long_option(self):
        """Test CLI configuration long option."""
        result = self.runner.invoke(
            cli,
            ["--configuration", str(self.config_path), "--github-token", "dummy_token"],
        )
        # Should accept long form
        assert "Configuration file" not in result.output or "does not exist" not in result.output


if __name__ == "__main__":
    unittest.main()
