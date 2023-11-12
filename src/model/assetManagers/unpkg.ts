/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import axios from 'axios';
import {IsDefined, IsString} from 'class-validator';
import {BmycError, unknownLatestVersionError} from '../bmycError';
import {AssetManager} from './assetManager';

const UNPKG_API_URL = 'https://unpkg.com';

export class Unpkg extends AssetManager {
  @IsDefined()
  @IsString()
  private library: string;
  /* c8 ignore start */
  public get _library(): string {
    return this.library;
  }
  public set _library(value: string) {
    this.library = value;
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
    const url = `${UNPKG_API_URL}/${this.library}/`;
    return axios({
      method: 'get',
      url: url,
    })
      .then((response: any) => {
        // Unpkg should redirect to the latest version of the package by default
        let version = response.request.res.responseUrl.replace(
          new RegExp(`.*${this.library}@`),
          ''
        );
        version = version.replace(new RegExp('/.*'), '');
        if (version) {
          return Promise.resolve(version);
        } else {
          throw unknownLatestVersionError(`${this.library}/${this.filePath}`);
        }
      })
      .catch((error: Error) => {
        throw new BmycError(`${url}:\n${error.message}`);
      });
  }

  getContent(assetVersion: string): Promise<Buffer> {
    const url = `${UNPKG_API_URL}/${this.library}@${assetVersion}/${this.filePath}`;
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
