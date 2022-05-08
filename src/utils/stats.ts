/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as path from 'path';
import {logger} from './logger';
import {Asset} from '../model/configurationFile/asset';
import {getBorderCharacters, table, TableUserConfig} from 'table';
import {blue, Color, gray, green, red, white, yellow} from 'kleur';

export class PrintEntry {
  constructor(
    public readonly content: string,
    public readonly color: Color = white
  ) {}
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

function HELD(isNewVersion: boolean): PrintEntry {
  return isNewVersion
    ? new PrintEntry('HELD\n(OUTDATED)', yellow)
    : new PrintEntry('HELD\n(UP-TO-DATE)', yellow);
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
    this.tableConfig = {
      border: getBorderCharacters('norc'),
      header: {
        content: gray('Asset results summary'),
      },
      columns: {
        4: {alignment: 'center'},
        5: {alignment: 'center'},
      },
    };
  }

  private static enhanceTableResults(): void {
    this.results.unshift(PrintResults.columnHeader);
    this.results.forEach((entry, entryIndex) => {
      const tempEntry: TableEntry = [];
      entry.map((value, index) => {
        tempEntry[index] = value.color(value.content);
      });
      this.table[entryIndex] = tempEntry;
    });
  }

  public static printResults() {
    this.orderResults();
    this.tableResultsConfig();
    this.enhanceTableResults();
    this.table.length
      ? logger().info(`\n${table(this.table, this.tableConfig)}`)
      : logger().error('No results available');
  }
}

export function getStatus(asset: Asset, error?: Error): PrintEntry {
  return error
    ? STATUS_ERROR
    : asset._isUpdated
    ? STATUS_UPDATED
    : asset._hold
    ? HELD(asset._isNewVersion)
    : STATUS_UPTODATE;
}

export function getAssetVersion(asset: Asset): string {
  return asset._latestVersion
    ? asset._isUpdated || asset._hold
      ? `${asset._beforeUpdateVersion}\n(${asset._latestVersion})`
      : asset._latestVersion
    : asset._currentVersion || 'N/A';
}

export function getSummary(asset: Asset, error?: Error): string {
  return error
    ? error.message
    : path.normalize(path.relative('', asset._localPath.toString()));
}
