/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import axios from 'axios';
import {IsDefined, IsString} from 'class-validator';
import {unknownLatestVersionError} from '../bmycError';
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
    return axios({
      method: 'get',
      url: `${UNPKG_API_URL}/${this.library}/`,
    }).then((response: any) => {
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
    });
  }

  getContent(assetVersion: string): Promise<Buffer> {
    return axios({
      method: 'get',
      url: `${UNPKG_API_URL}/${this.library}@${assetVersion}/${this.filePath}`,
    }).then((response: any) => {
      return Promise.resolve(response.data);
    });
  }
}
