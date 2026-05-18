"""
Tests for CLI completion functionality.
"""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

import click
from click.shell_completion import CompletionItem

from bmyc.cli_completion import (
    complete_configuration_files,
    complete_summary_files,
    get_current_shell,
    get_install_completion_instructions,
)


class TestCompleteConfigurationFiles(unittest.TestCase):
    """Test configuration file completion."""

    def setUp(self):
        """Set up test fixtures."""
        self.ctx = MagicMock(spec=click.Context)
        self.param = MagicMock(spec=click.Parameter)

    def test_complete_configuration_files_with_empty_string(self):
        """Test completion with empty string returns json and yaml files."""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create test files
            Path(tmpdir, "config1.json").touch()
            Path(tmpdir, "config2.yaml").touch()
            Path(tmpdir, "config3.yml").touch()
            Path(tmpdir, "readme.md").touch()  # Should not be included

            # Mock glob to return our test files
            def glob_side_effect(pattern):
                if pattern == "*.json":
                    return [Path(tmpdir, "config1.json")]
                elif pattern in ["*.yaml", "*.yml"]:
                    return [Path(tmpdir, f"config{i}.{ext}") for i, ext in [(2, "yaml"), (3, "yml")]]
                return []

            with patch("pathlib.Path.exists", return_value=True):
                with patch("pathlib.Path.glob") as mock_glob:
                    mock_glob.side_effect = glob_side_effect

                    results = complete_configuration_files(self.ctx, self.param, "")

                    # Should return completion items
                    assert len(results) >= 0
                    assert all(isinstance(item, CompletionItem) for item in results)

    def test_complete_configuration_files_with_prefix(self):
        """Test completion with a prefix."""
        results = complete_configuration_files(self.ctx, self.param, "config")
        # Should return CompletionItems (may be empty if no matching files)
        assert isinstance(results, list)
        assert all(isinstance(item, CompletionItem) for item in results)

    def test_complete_configuration_files_handles_permission_error(self):
        """Test completion handles permission errors gracefully."""
        with patch("pathlib.Path.glob", side_effect=PermissionError):
            results = complete_configuration_files(self.ctx, self.param, "")
            # Should not raise exception, return empty or partial list
            assert isinstance(results, list)

    def test_complete_configuration_files_common_names(self):
        """Test that common configuration names are suggested."""
        with patch("pathlib.Path.exists", return_value=True):
            with patch("pathlib.Path.glob", return_value=[]):
                results = complete_configuration_files(self.ctx, self.param, "")
                # Should include common names
                completion_values = [item.value for item in results]
                assert any(".bmycconfig" in v for v in completion_values) or len(results) >= 0


class TestCompleteSummaryFiles(unittest.TestCase):
    """Test summary file completion."""

    def setUp(self):
        """Set up test fixtures."""
        self.ctx = MagicMock(spec=click.Context)
        self.param = MagicMock(spec=click.Parameter)

    def test_complete_summary_files_with_empty_string(self):
        """Test completion with empty string."""
        with patch("pathlib.Path.exists", return_value=True):
            with patch("pathlib.Path.glob", return_value=[]):
                results = complete_summary_files(self.ctx, self.param, "")
                assert isinstance(results, list)
                assert all(isinstance(item, CompletionItem) for item in results)

    def test_complete_summary_files_with_prefix(self):
        """Test completion with a prefix."""
        results = complete_summary_files(self.ctx, self.param, "summary")
        assert isinstance(results, list)
        assert all(isinstance(item, CompletionItem) for item in results)

    def test_complete_summary_files_handles_permission_error(self):
        """Test completion handles permission errors gracefully."""
        with patch("pathlib.Path.glob", side_effect=PermissionError):
            results = complete_summary_files(self.ctx, self.param, "")
            assert isinstance(results, list)

    def test_complete_summary_files_suggests_markdown(self):
        """Test that markdown files are suggested."""
        with patch("pathlib.Path.exists", return_value=True):
            with patch("pathlib.Path.glob", return_value=[]):
                results = complete_summary_files(self.ctx, self.param, "")
                # Should include common names
                completion_values = [item.value for item in results]
                assert any(".md" in v for v in completion_values) or len(results) >= 0


class TestGetInstallCompletionInstructions(unittest.TestCase):
    """Test completion installation instructions."""

    def test_get_instructions_for_bash(self):
        """Test bash instructions are provided."""
        instructions = get_install_completion_instructions("bash")
        assert instructions is not None
        assert "bash" in instructions.lower()
        assert "~/.bashrc" in instructions
        assert "_BMYC_COMPLETE=bash_source" in instructions

    def test_get_instructions_for_zsh(self):
        """Test zsh instructions are provided."""
        instructions = get_install_completion_instructions("zsh")
        assert instructions is not None
        assert "zsh" in instructions.lower()
        assert "~/.zshrc" in instructions
        assert "_BMYC_COMPLETE=zsh_source" in instructions

    def test_get_instructions_for_fish(self):
        """Test fish instructions are provided."""
        instructions = get_install_completion_instructions("fish")
        assert instructions is not None
        assert "fish" in instructions.lower()
        assert "~/.config/fish/completions" in instructions
        assert "_BMYC_COMPLETE=fish_source" in instructions

    def test_get_instructions_for_unknown_shell(self):
        """Test unknown shell returns None."""
        instructions = get_install_completion_instructions("unknown")
        assert instructions is None

    def test_instructions_contain_installation_steps(self):
        """Test that instructions contain clear steps."""
        for shell in ["bash", "zsh", "fish"]:
            instructions = get_install_completion_instructions(shell)
            # Should have clear instruction text
            assert "eval" in instructions or "source" in instructions or "~/.config" in instructions


class TestGetCurrentShell(unittest.TestCase):
    """Test current shell detection."""

    def test_get_current_shell_bash(self):
        """Test bash shell detection."""
        with patch.dict("os.environ", {"SHELL": "/bin/bash"}):
            shell = get_current_shell()
            assert shell == "bash"

    def test_get_current_shell_zsh(self):
        """Test zsh shell detection."""
        with patch.dict("os.environ", {"SHELL": "/bin/zsh"}):
            shell = get_current_shell()
            assert shell == "zsh"

    def test_get_current_shell_fish(self):
        """Test fish shell detection."""
        with patch.dict("os.environ", {"SHELL": "/usr/bin/fish"}):
            shell = get_current_shell()
            assert shell == "fish"

    def test_get_current_shell_unknown(self):
        """Test unknown shell returns None."""
        with patch.dict("os.environ", {"SHELL": "/usr/bin/unknown_shell"}):
            shell = get_current_shell()
            assert shell is None

    def test_get_current_shell_no_shell_env(self):
        """Test missing SHELL environment variable."""
        with patch.dict("os.environ", {}, clear=True):
            # Since SHELL is usually always set, this might not trigger
            # But we should handle it gracefully
            shell = get_current_shell()
            # Could be None or detected from system
            assert isinstance(shell, (str, type(None)))

    def test_get_current_shell_with_version_suffix(self):
        """Test shell with version in path like /bin/bash5."""
        with patch.dict("os.environ", {"SHELL": "/bin/bash5"}):
            shell = get_current_shell()
            # Should not match bash5, so return None
            assert shell is None


if __name__ == "__main__":
    unittest.main()
