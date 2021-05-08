/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as path from 'path';
import {logger} from './logger';
import {Color, gray, green, red, yellow} from 'kleur';
import {MAX_TTY_LENGTH, NOT_AVAILABLE} from './const';
import {Asset} from '../model/configurationFile/asset';
import {getBorderCharacters, table, TableUserConfig} from 'table';

class BumpStatus {
  static readonly HEADER = new BumpStatus('Status', gray);
  static readonly UPDATED = new BumpStatus('UPDATED', green);
  static readonly UPTODATE = new BumpStatus('UP-TO-DATE', yellow);
  static readonly ERROR = new BumpStatus('ERROR', red);

  private constructor(
    public readonly status: string,
    public readonly color: Color
  ) {}
}

export type BumpResultEntry = [BumpStatus, string, string, string];

export class BumpResults {
  private static columnHeader: BumpResultEntry = [
    BumpStatus.HEADER,
    gray('Name'),
    gray('Local path'),
    gray('Version'),
  ];
  private static tableConfig: TableUserConfig;
  private static _results: BumpResultEntry[] = [BumpResults.columnHeader];
  public static get results(): BumpResultEntry[] {
    return BumpResults._results;
  }
  public static set results(value: BumpResultEntry[]) {
    BumpResults._results = value;
  }

  private static maxSize(map: any, maxSize: number): number {
    return Math.min(
      Math.max(...Object.values(map as any[]).map(el => el.length)),
      maxSize
    );
  }

  private static enhanceTableResults(): void {
    this.results.forEach(entry =>
      entry.map((value, index) => {
        if (value instanceof BumpStatus) {
          entry[index] = value.color(value.status);
        }
      })
    );
  }

  private static tableResultsConfig(): void {
    const globalPaddingSize: number = 2 * 2 + 3 * (this.results[0].length - 1);
    const maxColumnSize: number = Math.floor(
      (MAX_TTY_LENGTH - globalPaddingSize) / this.results[0].length
    );
    const statusSize: number = this.maxSize(
      this.results.map(entry => entry[0].status),
      maxColumnSize
    );
    const nameSize: number = this.maxSize(
      this.results.map(entry => entry[1]),
      maxColumnSize
    );
    const versionSize: number = this.maxSize(
      this.results.map(entry => entry[3]),
      maxColumnSize
    );
    const summarySize: number = Math.max(
      MAX_TTY_LENGTH - globalPaddingSize - statusSize - nameSize - versionSize,
      maxColumnSize
    );
    this.tableConfig = {
      border: getBorderCharacters('norc'),
      header: {
        content: gray('Asset results summary'),
      },
      columns: [
        {width: statusSize},
        {width: nameSize},
        {width: summarySize},
        {width: versionSize},
      ],
    };
  }

  public static addResults(
    status: BumpStatus,
    assetName: string,
    summary: string,
    assetVersion: string = NOT_AVAILABLE
  ) {
    this.results.push([status, assetName, summary, assetVersion]);
  }

  public static orderResults() {
    this.results.sort((r1, r2) => {
      const r1Status = Object.values(BumpStatus).indexOf(r1[0] as BumpStatus);
      const r2Status = Object.values(BumpStatus).indexOf(r2[0] as BumpStatus);
      return r1Status === r2Status
        ? r1[1].localeCompare(r2[1])
        : r1Status - r2Status;
    });
  }

  public static printResults() {
    this.orderResults();
    this.tableResultsConfig();
    this.enhanceTableResults();
    this.results.length
      ? logger().info(`\n${table(this.results, this.tableConfig)}`)
      : logger().error('No results available');
  }

  public static storeResult(asset: Asset, error?: Error) {
    this.addResults(
      getStatus(asset, error),
      asset._name,
      getSummary(asset, error),
      asset._currentVersion
    );
  }
}

export function getStatus(asset: Asset, error?: Error): BumpStatus {
  return asset._isUpdated
    ? BumpStatus.UPDATED
    : !error
    ? BumpStatus.UPTODATE
    : BumpStatus.ERROR;
}

export function getSummary(asset: Asset, error?: Error): string {
  return error
    ? error.message
    : path.normalize(path.relative('', asset._localPath.toString()));
}
