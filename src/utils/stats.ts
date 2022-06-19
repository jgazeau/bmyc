/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as path from 'path';
import * as fs from 'fs-extra';
import {PathLike} from 'fs';
import {logger} from './logger';
import {Asset} from '../model/configurationFile/asset';
import {getBorderCharacters, table, TableUserConfig} from 'table';
import {blue, Color, gray, green, red, white, yellow} from 'kleur';
import {
  NOT_AVAILABLE,
  SUMMARY_PR_NOT_GENERATED,
  SUMMARY_PR_TITLE,
} from './const';

export class PrintEntry {
  constructor(
    public readonly content: string,
    public readonly color: Color = white
  ) {}
  toString(): string {
    return this.content;
  }
  toColoredString(): string {
    return this.color(this.content);
  }
}

const HEADER_PACKAGE = new PrintEntry('Package', gray);
const HEADER_NAME = new PrintEntry('Name', gray);
const HEADER_PATH = new PrintEntry('Local path', gray);
const HEADER_VERSION = new PrintEntry('Version', gray);
const HEADER_STATUS = new PrintEntry('Status', gray);

export const STATUS_UPDATED = new PrintEntry('UPDATED', green);
export const STATUS_UPTODATE = new PrintEntry('UP-TO-DATE', blue);
export const STATUS_ERROR = new PrintEntry('ERROR', red);

class SortedStatus {
  static readonly STATUS_UPDATED: PrintEntry = STATUS_UPDATED;
  static readonly STATUS_UPTODATE: PrintEntry = STATUS_UPTODATE;
  static readonly STATUS_ERROR: PrintEntry = STATUS_ERROR;
}

export function HELD(isNewVersion: boolean, separator = '\n'): PrintEntry {
  return isNewVersion
    ? new PrintEntry(`HELD${separator}(OUTDATED)`, yellow)
    : new PrintEntry(`HELD${separator}(UP-TO-DATE)`, yellow);
}

export type ResultEntry = [
  PrintEntry,
  PrintEntry,
  PrintEntry,
  PrintEntry,
  PrintEntry
];
type TableEntry = [string?, string?, string?, string?, string?] | [];

export class PrintResults {
  private static columnHeader: ResultEntry = [
    HEADER_PACKAGE,
    HEADER_NAME,
    HEADER_PATH,
    HEADER_VERSION,
    HEADER_STATUS,
  ];

  private static _totalCount = {
    heldOutdated: 0,
    heldUptodate: 0,
    error: 0,
    uptodate: 0,
    updated: 0,
  };
  /* c8 ignore start */
  public static get totalCount() {
    return PrintResults._totalCount;
  }
  public static set totalCount(value) {
    PrintResults._totalCount = value;
  }
  /* c8 ignore stop */

  private static _tableConfig: TableUserConfig;
  /* c8 ignore start */
  public static get tableConfig(): TableUserConfig {
    return PrintResults._tableConfig;
  }
  public static set tableConfig(value: TableUserConfig) {
    PrintResults._tableConfig = value;
  }
  /* c8 ignore stop */

  private static _table: TableEntry[] = [];
  /* c8 ignore start */
  public static get table(): TableEntry[] {
    return PrintResults._table;
  }
  public static set table(value: TableEntry[]) {
    PrintResults._table = value;
  }
  /* c8 ignore stop */

  private static _results: ResultEntry[] = [];
  /* c8 ignore start */
  public static get results(): ResultEntry[] {
    return PrintResults._results;
  }
  public static set results(value: ResultEntry[]) {
    PrintResults._results = value;
  }
  /* c8 ignore stop */

  public static orderResults() {
    this.results.sort((r1, r2) => {
      const r1Status = Object.values(SortedStatus).indexOf(r1[4] as PrintEntry);
      const r2Status = Object.values(SortedStatus).indexOf(r2[4] as PrintEntry);
      return r1[0].content === r2[0].content
        ? r1Status === r2Status
          ? r1[1].content.localeCompare(r2[1].content)
          : r1Status - r2Status
        : r1[0].content.localeCompare(r2[0].content);
    });
  }

  public static storeResult(asset: Asset, error?: Error) {
    this.results.push([
      new PrintEntry(asset._package),
      new PrintEntry(asset._name),
      new PrintEntry(getSummary(asset, error)),
      new PrintEntry(getAssetVersion(asset)),
      getStatus(asset, error),
    ]);
  }

  private static tableResultsConfig(): void {
    const maxColSpan = this.columnHeader.length;
    const totalColSpan = this.columnHeader.length - 1;
    this.tableConfig = {
      border: getBorderCharacters('norc'),
      header: {
        content: gray('Asset results summary'),
      },
      columns: {
        4: {alignment: 'center'},
        5: {alignment: 'center'},
      },
      spanningCells: [
        {
          col: 0,
          row: this.table.length - 6,
          colSpan: maxColSpan,
          alignment: 'center',
        },
        {
          col: 0,
          row: this.table.length - 5,
          colSpan: totalColSpan,
          alignment: 'right',
        },
        {
          col: 0,
          row: this.table.length - 4,
          colSpan: totalColSpan,
          alignment: 'right',
        },
        {
          col: 0,
          row: this.table.length - 3,
          colSpan: totalColSpan,
          alignment: 'right',
        },
        {
          col: 0,
          row: this.table.length - 2,
          colSpan: totalColSpan,
          alignment: 'right',
        },
        {
          col: 0,
          row: this.table.length - 1,
          colSpan: totalColSpan,
          alignment: 'right',
        },
      ],
    };
  }

  private static enhanceTableResults(): void {
    this.results.unshift(PrintResults.columnHeader);
    this.results.forEach((entry, entryIndex) => {
      const tempEntry: TableEntry = [];
      entry.map((entry, index) => {
        tempEntry[index] = entry.toColoredString();
      });
      this.table[entryIndex] = tempEntry;
    });
  }

  public static manageResults(summaryPR?: PathLike): Promise<void> {
    this.orderResults();
    this.enhanceTableResults();
    this.totals();
    this.tableResultsConfig();
    this.printResults();
    if (this.totalCount.error) {
      process.exitCode = 1;
    }
    if (summaryPR) {
      return this.saveSummaryPR(summaryPR);
    } else {
      return Promise.resolve();
    }
  }

  public static totals() {
    this.table.push(
      [gray('Totals '), '', '', '', ''],
      [
        HELD(true, ' ').toColoredString(),
        '',
        '',
        '',
        `${this.totalCount.heldOutdated}`,
      ],
      [
        HELD(false, ' ').toColoredString(),
        '',
        '',
        '',
        `${this.totalCount.heldUptodate}`,
      ],
      [STATUS_ERROR.toColoredString(), '', '', '', `${this.totalCount.error}`],
      [
        STATUS_UPTODATE.toColoredString(),
        '',
        '',
        '',
        `${this.totalCount.uptodate}`,
      ],
      [
        STATUS_UPDATED.toColoredString(),
        '',
        '',
        '',
        `${this.totalCount.updated}`,
      ]
    );
  }

  private static printResults() {
    this.table.length
      ? logger().info(`\n${table(this.table, this.tableConfig)}`)
      : logger().error('No results available');
  }

  private static saveSummaryPR(summaryPR: PathLike): Promise<void> {
    if (this.totalCount.updated !== 0) {
      return fs.writeFile(
        path.normalize(summaryPR.toString()),
        PrintResults.buildSummaryPR(),
        {
          flag: 'w',
        }
      );
    } else {
      logger().debug(SUMMARY_PR_NOT_GENERATED);
      return Promise.resolve();
    }
  }

  private static buildSummaryPR(): string {
    let summary = SUMMARY_PR_TITLE;
    summary = summary.concat('\n\n');
    summary = summary.concat(PrintResults.buildSummaryRow(this.columnHeader));
    summary = summary.concat('| - | - | - | - | - |\n');
    this.results.forEach(entry => {
      if (entry.includes(STATUS_UPDATED)) {
        summary = summary.concat(PrintResults.buildSummaryRow(entry));
      }
    });
    return summary;
  }

  private static buildSummaryRow(entry: ResultEntry): string {
    return `| ${entry[0]} | ${entry[1]} | ${entry[2]} | ${entry[3]} | ${entry[4]} |\n`;
  }
}

export function getStatus(asset: Asset, error?: Error): PrintEntry {
  let printEntry;
  error
    ? ((printEntry = STATUS_ERROR), PrintResults.totalCount.error++)
    : asset._isUpdated
    ? ((printEntry = STATUS_UPDATED), PrintResults.totalCount.updated++)
    : asset._hold
    ? asset._isNewVersion
      ? ((printEntry = HELD(asset._isNewVersion)),
        PrintResults.totalCount.heldOutdated++)
      : ((printEntry = HELD(asset._isNewVersion)),
        PrintResults.totalCount.heldUptodate++)
    : ((printEntry = STATUS_UPTODATE), PrintResults.totalCount.uptodate++);
  return printEntry;
}

export function getAssetVersion(asset: Asset): string {
  return asset._latestVersion
    ? asset._isUpdated || asset._hold
      ? `${asset._beforeUpdateVersion}\n(${asset._latestVersion})`
      : asset._latestVersion
    : asset._currentVersion || NOT_AVAILABLE;
}

export function getSummary(asset: Asset, error?: Error): string {
  return error
    ? error.message
    : path.normalize(path.relative('', asset._localPath.toString()));
}
