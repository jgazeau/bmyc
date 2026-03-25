import asyncio
import logging

from bmyc.cli_context import CliContext
from bmyc.commons.bmyc_error import BmycError
from bmyc.commons.helpers import to_dto
from bmyc.commons.json import to_pretty_json
from bmyc.commons.logging import log_header, log_horizontal_rule, log_title
from bmyc.model.bmyc_configuration import BmycConfiguration
from bmyc.model.providers.github import Github
from bmyc.results_handler import ResultsHandler


class Processor:
    def __init__(self, cli_context: CliContext):
        self.__cli_context = cli_context
        self.__print_header()
        self.__bmyc_configuration = BmycConfiguration.model_validate(to_dto(self.__cli_context.configuration))
        self.__post_init_checks()

    def process(self):
        logging.debug("Processing Bmyc configuration...")
        logging.debug(
            f"Processing "
            f"{len(self.__bmyc_configuration.packages)} packages and "
            f"{sum([len(package.assets) for package in self.__bmyc_configuration.packages.values()])} assets..."
        )
        asyncio.run(self.__process_configuration())
        self.__cli_context.configuration.write_text(f"{to_pretty_json(self.__bmyc_configuration.model_dump(), indent=2)}\n")
        ResultsHandler().print_results()
        ResultsHandler().save_summary(self.__cli_context.summary)

    def __print_header(self):
        log_header()
        log_title("CLI Arguments")
        logging.info(f"Configuration file: {self.__cli_context.configuration}")
        logging.info(f"Summary file      : {self.__cli_context.summary}")
        logging.info(f"Force update      : {self.__cli_context.force}")
        log_horizontal_rule()

    def __post_init_checks(self):
        logging.debug("Checking post-initialization conditions...")
        # Check for duplicate local paths
        assets = [
            (package_name, asset_name, asset.local_path)
            for package_name, package in self.__bmyc_configuration.packages.items()
            for asset_name, asset in package.assets.items()
        ]
        if len(set([local_path for _, _, local_path in assets])) != len(assets):
            duplicates = set([local_path for _, _, local_path in assets if [local_path for _, _, local_path in assets].count(local_path) > 1])
            duplicate_assets = [f"{package_name}.{asset_name}" for package_name, asset_name, local_path in assets if local_path in duplicates]
            raise BmycError(f"Duplicate local paths found for assets: {', '.join(duplicate_assets)}")
        # Check for mandatory GitHub token if any asset uses GitHub provider
        for package_name, asset_name, asset in [
            (package_name, asset_name, asset)
            for package_name, package in self.__bmyc_configuration.packages.items()
            for asset_name, asset in package.assets.items()
        ]:
            if isinstance(asset.provider, Github) and not self.__cli_context.github_token:
                raise BmycError(f"GitHub token is required for asset '{package_name}.{asset_name}' with GitHub provider")

    async def __process_configuration(self):
        tasks = []
        for package_name, package in self.__bmyc_configuration.packages.items():
            logging.debug(f"Processing package: {package_name}...")
            for asset_name, asset in package.assets.items():
                logging.debug(f"Processing asset: {asset_name}...")
                tasks.append(asset.bump_to_latest_version(self.__cli_context))
        await asyncio.gather(*tasks)
