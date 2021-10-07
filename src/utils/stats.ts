/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as path from 'path';
import {logger} from './logger';
import {MAX_TTY_LENGTH, NOT_AVAILABLE} from './const';
import {Asset} from '../model/configurationFile/asset';
import {blue, Color, gray, green, red, yellow} from 'kleur';
import {getBorderCharacters, table, TableUserConfig} from 'table';

class BumpStatus {
  static readonly HEADER = new BumpStatus('Status', gray);
  static readonly UPDATED = new BumpStatus('UPDATED', green);
  static readonly UPTODATE = new BumpStatus('UP-TO-DATE', blue);
  static readonly ERROR = new BumpStatus('ERROR', red);
  static HELD(isNewVersion: boolean): BumpStatus {
    return isNewVersion
      ? new BumpStatus('HELD\n(NEW VERSION\nAVAILABLE)', yellow)
      : new BumpStatus('HELD\n(UP-TO-DATE)', yellow);
  }

  private constructor(
    public readonly status: string,
    public readonly color: Color
  ) {}
}

export type BumpResultEntry = [string, string, string, string, BumpStatus];

export class BumpResults {
  private static columnHeader: BumpResultEntry = [
    gray('Package'),
    gray('Name'),
    gray('Local path'),
    gray('Version'),
    BumpStatus.HEADER,
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
    const packageSize = 16;
    const nameSize: number = this.maxSize(
      this.results.map(entry => entry[1]),
      maxColumnSize
    );
    const versionSize: number = this.maxSize(
      this.results.map(entry => entry[3]),
      maxColumnSize
    );
    const statusSize: number = this.maxSize(
      this.results.map(entry => entry[4].status),
      maxColumnSize
    );
    const summarySize: number = Math.max(
      MAX_TTY_LENGTH -
        globalPaddingSize -
        packageSize -
        nameSize -
        versionSize -
        statusSize,
      maxColumnSize
    );
    this.tableConfig = {
      border: getBorderCharacters('norc'),
      header: {
        content: gray('Asset results summary'),
      },
      columns: [
        {width: packageSize},
        {width: nameSize},
        {width: summarySize},
        {width: versionSize},
        {width: statusSize, alignment: 'center'},
      ],
    };
  }

  public static addResults(
    packageName: string,
    assetName: string,
    summary: string,
    assetVersion: string = NOT_AVAILABLE,
    status: BumpStatus
  ) {
    this.results.push([packageName, assetName, summary, assetVersion, status]);
  }

  public static orderResults() {
    this.results.sort((r1, r2) => {
      const r1Status = Object.values(BumpStatus).indexOf(r1[4] as BumpStatus);
      const r2Status = Object.values(BumpStatus).indexOf(r2[4] as BumpStatus);
      return r1[0] === r2[0]
        ? r1Status === r2Status
          ? r1[1].localeCompare(r2[1])
          : r1Status - r2Status
        : r1[0].localeCompare(r2[0]);
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
      asset._package,
      asset._name,
      getSummary(asset, error),
      asset._currentVersion,
      getStatus(asset, error)
    );
  }
}

export function getStatus(asset: Asset, error?: Error): BumpStatus {
  return error
    ? BumpStatus.ERROR
    : asset._isUpdated
    ? BumpStatus.UPDATED
    : asset._hold
    ? BumpStatus.HELD(asset._isNewVersion)
    : BumpStatus.UPTODATE;
}

export function getSummary(asset: Asset, error?: Error): string {
  return error
    ? error.message
    : path.normalize(path.relative('', asset._localPath.toString()));
}
