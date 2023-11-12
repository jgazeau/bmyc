/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import axios from 'axios';
import {IsDefined, IsString} from 'class-validator';
import {BmycError, unknownLatestVersionError} from '../bmycError';
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
    const url = `${JSDELIVR_API_URL}/${JSDELIVR_PACKAGE_PATH}/${this.cdn}/${this.package}`;
    return axios({
      method: 'get',
      url: url,
    })
      .then((response: any) => {
        const version = response.data.tags.latest;
        if (version) {
          return Promise.resolve(version);
        } else {
          throw unknownLatestVersionError(`${this.cdn}/${this.package}`);
        }
      })
      .catch((error: Error) => {
        throw new BmycError(`${url}:\n${error.message}`);
      });
  }

  getContent(assetVersion: string): Promise<Buffer> {
    const url = `${JSDELIVR_DATA_URL}/${this.cdn}/${this.package}@${assetVersion}/${this.filePath}`;
    return axios({
      method: 'get',
      responseType: 'arraybuffer',
      url: url,
    })
      .then((response: any) => {
        if (response.data) {
          return Promise.resolve(Buffer.from(response.data));
        } else {
          throw new BmycError(
            `Cannot get content of ${this.filePath} (${assetVersion})`
          );
        }
      })
      .catch((error: Error) => {
        throw new BmycError(`${url}:\n${error.message}`);
      });
  }
}
