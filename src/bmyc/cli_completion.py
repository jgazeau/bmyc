"""
Shell completion utilities for the bmyc CLI.

Provides dynamic completion suggestions for shell environments.
"""

import os
from pathlib import Path

import click
from click.shell_completion import CompletionItem


def complete_configuration_files(ctx: click.Context, param: click.Parameter, incomplete: str) -> list[CompletionItem]:
    """
    Complete configuration file paths.

    Suggests .json and .yaml configuration files in the current directory and subdirectories.

    Args:
        ctx: Click context
        param: The parameter being completed
        incomplete: The incomplete path string being typed

    Returns:
        List of CompletionItem objects with matching file paths
    """
    results = []

    # Parse the incomplete path
    incomplete_path = Path(incomplete)
    if incomplete.endswith("/"):
        search_dir = incomplete_path
    else:
        search_dir = incomplete_path.parent if incomplete_path.parent != Path(".") else Path(".")

    # Ensure search directory exists
    if not search_dir.exists():
        search_dir = Path(".")

    try:
        # Search for config files (.json and .yaml)
        for pattern in ["*.json", "*.yaml", "*.yml"]:
            for file_path in search_dir.glob(pattern):
                if incomplete == "":
                    # Show all config files from current directory
                    if file_path.is_file():
                        results.append(CompletionItem(str(file_path)))
                else:
                    # Filter by incomplete prefix
                    full_path = str(file_path)
                    if full_path.startswith(incomplete):
                        results.append(CompletionItem(full_path))
    except OSError, PermissionError:
        # If we can't read the directory, return empty list
        pass

    # Also include common config file names as suggestions
    common_names = [".bmycconfig.json", ".bmycconfig.yaml", "bmyc.json", "bmyc.yaml"]
    for name in common_names:
        if not incomplete or name.startswith(incomplete):
            if Path(name).exists():
                results.append(CompletionItem(name))

    return results


def complete_summary_files(ctx: click.Context, param: click.Parameter, incomplete: str) -> list[CompletionItem]:
    """
    Complete summary file paths.

    Suggests .md markdown files as output summary files.

    Args:
        ctx: Click context
        param: The parameter being completed
        incomplete: The incomplete path string being typed

    Returns:
        List of CompletionItem objects with matching file paths
    """
    results = []

    # Parse the incomplete path
    incomplete_path = Path(incomplete)
    if incomplete.endswith("/"):
        search_dir = incomplete_path
    else:
        search_dir = incomplete_path.parent if incomplete_path.parent != Path(".") else Path(".")

    # Ensure search directory exists
    if not search_dir.exists():
        search_dir = Path(".")

    try:
        # Search for markdown files
        for file_path in search_dir.glob("*.md"):
            if incomplete == "":
                # Show all markdown files from current directory
                if file_path.is_file():
                    results.append(CompletionItem(str(file_path)))
            else:
                # Filter by incomplete prefix
                full_path = str(file_path)
                if full_path.startswith(incomplete):
                    results.append(CompletionItem(full_path))
    except OSError, PermissionError:
        # If we can't read the directory, return empty list
        pass

    # Common summary file names
    common_names = ["bmyc-summary.md", "summary.md"]
    for name in common_names:
        if not incomplete or name.startswith(incomplete):
            results.append(CompletionItem(name))

    return results


def get_install_completion_instructions(shell: str) -> str | None:
    """
    Get shell-specific installation instructions for completion.

    Args:
        shell: The shell name (bash, zsh, or fish)

    Returns:
        Installation instructions for the specified shell
    """
    instructions = {
        "bash": (
            "To enable bash completion, add the following line to ~/.bashrc:\n\n"
            '    eval "$(_BMYC_COMPLETE=bash_source bmyc)"\n\n'
            "Then reload your shell:\n"
            "    source ~/.bashrc"
        ),
        "zsh": (
            "To enable zsh completion, add the following line to ~/.zshrc:\n\n"
            '    eval "$(_BMYC_COMPLETE=zsh_source bmyc)"\n\n'
            "Then reload your shell:\n"
            "    source ~/.zshrc"
        ),
        "fish": (
            "To enable fish completion, run:\n\n"
            "    _BMYC_COMPLETE=fish_source bmyc | source\n\n"
            "Or save the completion permanently:\n"
            "    mkdir -p ~/.config/fish/completions\n"
            "    _BMYC_COMPLETE=fish_source bmyc > ~/.config/fish/completions/bmyc.fish"
        ),
    }

    return instructions.get(shell, None)


def get_current_shell() -> str | None:
    """
    Detect the current shell being used.

    Returns:
        The current shell name (bash, zsh, or fish) or None if unable to detect
    """
    shell_env = os.environ.get("SHELL", "")

    if not shell_env:
        return None

    # Extract shell name from path
    shell_name = Path(shell_env).name
    if shell_name in ["bash", "zsh", "fish"]:
        return shell_name

    return None
