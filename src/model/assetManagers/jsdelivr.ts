/* eslint-disable @typescript-eslint/no-explicit-any*/
import axios from 'axios';
import {IsDefined, IsString} from 'class-validator';
import {unknownLatestVersionError} from '../bmycError';
import {AssetManager} from './assetManager';

const JSDELIVR_API_URL = 'https://data.jsdelivr.com/v1';
const JSDELIVR_DATA_URL = 'https://cdn.jsdelivr.net';
const JSDELIVR_PACKAGE_PATH = 'package';

export class Jsdelivr extends AssetManager {
  @IsDefined()
  @IsString()
  private cdn: string;
  /* c8 ignore start */
  public get _cdn(): string {
    return this.cdn;
  }
  public set _cdn(value: string) {
    this.cdn = value;
  }
  /* c8 ignore stop */

  @IsDefined()
  @IsString()
  private package: string;
  /* c8 ignore start */
  public get _package(): string {
    return this.package;
  }
  public set _package(value: string) {
    this.package = value;
  }
  /* c8 ignore stop */

  @IsDefined()
  @IsString()
  private filePath: string;
  /* c8 ignore start */
  public get _filePath(): string {
    return this.filePath;
  }
  public set _filePath(value: string) {
    this.filePath = value;
  }
  /* c8 ignore stop */

  getLatestVersion(): Promise<string> {
    return axios({
      method: 'get',
      url: `${JSDELIVR_API_URL}/${JSDELIVR_PACKAGE_PATH}/${this.cdn}/${this.package}`,
    }).then((response: any) => {
      const version = response.data.tags.latest;
      if (version) {
        return Promise.resolve(version);
      } else {
        throw unknownLatestVersionError(`${this.cdn}/${this.package}`);
      }
    });
  }

  getContent(assetVersion: string): Promise<Buffer> {
    return axios({
      method: 'get',
      url: `${JSDELIVR_DATA_URL}/${this.cdn}/${this.package}@${assetVersion}/${this.filePath}`,
    }).then((response: any) => {
      return Promise.resolve(response.data);
    });
  }
}