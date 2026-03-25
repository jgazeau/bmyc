import logging
from pathlib import Path

from prettytable import HRuleStyle, PrettyTable

from bmyc.commons.common_constants import MAX_TTY_LENGTH
from bmyc.commons.singleton import Singleton
from bmyc.model.asset_status_enum import AssetStatusEnum


class ResultsHandler(metaclass=Singleton):

    def __init__(self):
        self._error: int = 0
        self._outdated: int = 0
        self._updated: int = 0
        self._up_to_date: int = 0
        self._results: list[tuple[str, str, str, bool, str, str]] = []

    @property
    def error(self):
        return self._error

    @property
    def outdated(self):
        return self._outdated

    @property
    def updated(self):
        return self._updated

    @property
    def up_to_date(self):
        return self._up_to_date

    def add_result(
        self,
        package_name: str,
        asset_name: str,
        version: str,
        hold: bool,
        status: AssetStatusEnum,
        comment: str,
    ):
        if status == AssetStatusEnum.ERROR:
            self._error += 1
        elif status == AssetStatusEnum.OUTDATED:
            self._outdated += 1
        elif status == AssetStatusEnum.UPDATED:
            self._updated += 1
        elif status == AssetStatusEnum.UP_TO_DATE:
            self._up_to_date += 1
        self._results.append(
            (
                package_name,
                asset_name,
                version,
                hold,
                status.value,
                comment,
            )
        )

    def print_results(self):
        results_table = self._get_results_table()
        results_table.header = True
        results_table.hrules = HRuleStyle.ALL
        results_table.max_table_width = MAX_TTY_LENGTH
        results_table.max_width = {"Local Path/Error": 60}
        results_table.use_header_width = True
        results_table._set_double_border_style()
        totals_table = self._get_totals_table()
        totals_table.header = True
        totals_table.hrules = HRuleStyle.ALL
        totals_table.use_header_width = True
        totals_table._set_double_border_style()
        logging.info(f"\n{results_table}\n{totals_table}")

    def save_summary(self, summary: Path | None):
        if summary is not None:
            results_table = self._get_results_table()
            results_table._set_markdown_style()
            totals_table = self._get_totals_table()
            totals_table._set_markdown_style()
            summary.write_text(f"{results_table}\n\n{totals_table}\n")

    def _get_results_table(self) -> PrettyTable:
        results_table = PrettyTable(["Package", "Name", "Version", "Hold", "Status", "Local Path/Error"])
        results_table.add_rows([list(row) for row in self._results])
        return results_table

    def _get_totals_table(self) -> PrettyTable:
        totals_table = PrettyTable(["Total", "Count"])
        totals_table.add_row(["Error", self._error])
        totals_table.add_row(["Outdated", self._outdated])
        totals_table.add_row(["Updated", self._updated])
        totals_table.add_row(["Up-to-date", self._up_to_date])
        return totals_table
