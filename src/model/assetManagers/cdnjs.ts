/* eslint-disable @typescript-eslint/no-explicit-any*/
import axios from 'axios';
import {Github} from './github';
import {AssetManager} from './assetManager';
import {IsDefined, IsString} from 'class-validator';

const CDNJS_API_URL = 'https://api.cdnjs.com';
const CDNJS_GITHUB_OWNER = 'cdnjs';
const CDNJS_GITHUB_REPOSITORY = 'cdnjs';
const CDNJS_GITHUB_ROOT_FILEPATH = 'ajax/libs';
const CDNJS_GITHUB_REF = 'master';

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
    return axios({
      method: 'get',
      params: {
        fields: 'version',
      },
      url: `${CDNJS_API_URL}/libraries/${this.library}`,
    })
      .then((response: any) => {
        return Promise.resolve(response.data.version);
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  getContent(assetVersion: string): Promise<Buffer> {
    const cdnjsGithub = new Github();
    cdnjsGithub._owner = CDNJS_GITHUB_OWNER;
    cdnjsGithub._repository = CDNJS_GITHUB_REPOSITORY;
    cdnjsGithub._filePath = `${CDNJS_GITHUB_ROOT_FILEPATH}/${this.library}/${assetVersion}/${this.fileName}`;
    return cdnjsGithub
      .getSha(CDNJS_GITHUB_REF)
      .then((assetSha: string) => {
        return cdnjsGithub.getBlob(assetSha);
      })
      .catch((error: Error) => {
        throw error;
      });
  }
}
