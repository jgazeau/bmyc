/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as path from 'path';
import axios from 'axios';
import {BmycError} from '../bmycError';
import {IsDefined} from 'class-validator';
import {AssetManager} from './assetManager';

const GITHUB_API_URL = 'https://api.github.com';

export class Github extends AssetManager {
  @IsDefined()
  private owner: string;
  /* c8 ignore start */
  public get _owner(): string {
    return this.owner;
  }
  public set _owner(value: string) {
    this.owner = value;
  }
  /* c8 ignore stop */

  @IsDefined()
  private repository: string;
  /* c8 ignore start */
  public get _repository(): string {
    return this.repository;
  }
  public set _repository(value: string) {
    this.repository = value;
  }
  /* c8 ignore stop */

  @IsDefined()
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
    return this.checkGitHubToken()
      .then(() => {
        return axios({
          method: 'get',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
          url: `${GITHUB_API_URL}/repos/${this.owner}/${this.repository}/releases/latest`,
        }).then((response: any) => {
          return Promise.resolve(response.data.tag_name);
        });
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  getSha(assetRef: string): Promise<string> {
    return this.checkGitHubToken()
      .then(() => {
        return axios({
          method: 'get',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
          params: {
            ref: assetRef,
          },
          url: `${GITHUB_API_URL}/repos/${this.owner}/${
            this.repository
          }/contents/${path.dirname(this.filePath)}`,
        }).then((response: any) => {
          if (response.data.length) {
            const element: any = response.data.find(
              (el: any) => el.name === path.basename(this.filePath)
            );
            if (element) {
              switch (element.type) {
                case 'file': {
                  return Promise.resolve(element.sha);
                }
                default: {
                  throw new BmycError(
                    `Type of ${this.filePath} not allowed (${element.type})`
                  );
                }
              }
            } else {
              throw new BmycError(`Cannot find ${this.filePath}`);
            }
          } else {
            throw new BmycError(
              `${path.dirname(
                this.filePath
              )} should be a directory containing your file ${path.basename(
                this.filePath
              )}`
            );
          }
        });
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  getBlob(assetSha: string): Promise<string> {
    return this.checkGitHubToken()
      .then(() => {
        return axios({
          maxContentLength: 100000000,
          method: 'get',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
          url: `${GITHUB_API_URL}/repos/${this.owner}/${this.repository}/git/blobs/${assetSha}`,
        }).then((response: any) => {
          if (response.data.content) {
            return Promise.resolve(
              Buffer.from(
                response.data.content,
                response.data.encoding
              ).toString('utf-8')
            );
          } else {
            throw new BmycError(`Cannot get content of blob ${assetSha}`);
          }
        });
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  getContent(assetVersion: string): Promise<string> {
    return this.getSha(assetVersion)
      .then((assetSha: string) => {
        return this.getBlob(assetSha);
      })
      .catch((error: Error) => {
        throw error;
      });
  }
  private checkGitHubToken(): Promise<void> {
    if (process.env.GITHUB_TOKEN) {
      return Promise.resolve();
    } else {
      return Promise.reject(new BmycError('GITHUB_TOKEN variable is not set'));
    }
  }
}