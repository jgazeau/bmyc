import logging
from pathlib import Path
from typing import Optional

import click
import colorlog

from bmyc.cli_context import CliContext
from bmyc.commons.common_constants import (
    CLI_CONFIGURATION_OPTION,
    CLI_CONFIGURATION_OPTION_DEFAULT_VALUE,
    CLI_CONFIGURATION_SHORT_OPTION,
    CLI_FORCE_OPTION,
    CLI_FORCE_SHORT_OPTION,
    CLI_GITHUB_TOKEN_ENV_VAR_KEY,
    CLI_GITHUB_TOKEN_OPTION,
    CLI_INSECURE_OPTION,
    CLI_INSECURE_SHORT_OPTION,
    CLI_SUMMARY_OPTION,
    CLI_SUMMARY_OPTION_DEFAULT_VALUE,
    CLI_SUMMARY_SHORT_OPTION,
)
from bmyc.model.providers.provider import get_supported_providers
from bmyc.processor import Processor


def verbosity(verbose):
    VERBOSITY = [logging.ERROR, logging.WARNING, logging.INFO, logging.DEBUG]
    return VERBOSITY[min(verbose, len(VERBOSITY) - 1)]


@click.command(epilog=f"Following providers are supported: {get_supported_providers()}")
@click.help_option("-h", "--help")
@click.option("-v", "--verbose", count=True, default=2)
@click.option(
    CLI_FORCE_SHORT_OPTION,
    CLI_FORCE_OPTION,
    type=bool,
    is_flag=True,
    help="Force configuration update.",
)
@click.option(
    CLI_INSECURE_SHORT_OPTION,
    CLI_INSECURE_OPTION,
    type=bool,
    is_flag=True,
    help="Allow insecure TLS connections.",
)
@click.option(
    CLI_CONFIGURATION_SHORT_OPTION,
    CLI_CONFIGURATION_OPTION,
    type=click.Path(file_okay=True, dir_okay=False, resolve_path=True, path_type=Path, exists=True),
    required=True,
    default=CLI_CONFIGURATION_OPTION_DEFAULT_VALUE,
    help="Configuration file path. Configuration file must be a valid JSON or YAML file.",
)
@click.option(
    CLI_SUMMARY_SHORT_OPTION,
    CLI_SUMMARY_OPTION,
    type=click.Path(file_okay=True, dir_okay=False, resolve_path=False, path_type=Path),
    is_flag=False,
    flag_value=CLI_SUMMARY_OPTION_DEFAULT_VALUE,
    help="Summary file path.",
)
@click.option(
    CLI_GITHUB_TOKEN_OPTION,
    type=str,
    is_flag=False,
    envvar=CLI_GITHUB_TOKEN_ENV_VAR_KEY,
    default=None,
    help="GitHub token used to authenticate with the GitHub API.",
)
def cli(
    verbose: int,
    force: bool,
    insecure: bool,
    configuration: Path,
    summary: Path | None,
    github_token: Optional[str],
):
    """
    Bump Me if You Can. Tool used to bump static assets and keep them up-to-date.
    """
    handler = colorlog.StreamHandler()
    formatter = colorlog.ColoredFormatter(
        "%(log_color)s%(levelname)-8s%(reset)s %(log_color)s%(message)s",
        datefmt=None,
        reset=True,
        log_colors={
            "DEBUG": "cyan",
            "WARNING": "yellow",
            "ERROR": "bold_red",
            "CRITICAL": "bold_red,bg_white",
        },
        secondary_log_colors={},
        style="%",
    )
    handler.setFormatter(formatter)
    logging.basicConfig(
        level=verbosity(verbose),
        handlers=[handler],
    )
    processor = Processor(
        CliContext(
            force=force,
            insecure=insecure,
            configuration=configuration,
            summary=summary,
            github_token=github_token,
        )
    )
    processor.process()
