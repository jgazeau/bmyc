/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import axios from 'axios';
import {IsDefined, IsString} from 'class-validator';
import {BmycError, unknownLatestVersionError} from '../bmycError';
import {AssetManager} from './assetManager';

const CDNJS_API_URL = 'https://api.cdnjs.com';
const CDNJS_LIBRARIES_PATH = 'libraries';
const CDNJS_LIBS_HOST = 'https://cdnjs.cloudflare.com';
const CDNJS_LIBS_ROOT_PATH = 'ajax/libs';
const CDNJS_LIBS_ENCODING = 'utf-8';

export class Cdnjs extends AssetManager {
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
  private fileName: string;
  /* c8 ignore start */
  public get _fileName(): string {
    return this.fileName;
  }
  public set _fileName(value: string) {
    this.fileName = value;
  }
  /* c8 ignore stop */

  getLatestVersion(): Promise<string> {
    const url = `${CDNJS_API_URL}/${CDNJS_LIBRARIES_PATH}/${this.library}`;
    return axios({
      method: 'get',
      params: {
        fields: 'version',
      },
      url: url,
    })
      .then((response: any) => {
        const version = response.data.version;
        if (version) {
          return Promise.resolve(version);
        } else {
          throw unknownLatestVersionError(`${this.library}/${this.fileName}`);
        }
      })
      .catch((error: Error) => {
        throw new BmycError(`${url}:\n${error.message}`);
      });
  }

  getContent(assetVersion: string): Promise<Buffer> {
    const url = `${CDNJS_LIBS_HOST}/${CDNJS_LIBS_ROOT_PATH}/${this.library}/${assetVersion}/${this.fileName}`;
    return axios({
      maxContentLength: 100000000,
      maxBodyLength: 100000000,
      method: 'get',
      url: url,
    })
      .then((response: any) => {
        if (response.data) {
          return Promise.resolve(
            Buffer.from(response.data, CDNJS_LIBS_ENCODING)
          );
        } else {
          throw new BmycError(
            `Cannot get content of library ${this.fileName} (${assetVersion})`
          );
        }
      })
      .catch((error: Error) => {
        throw new BmycError(`${url}:\n${error.message}`);
      });
  }
}
