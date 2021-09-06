import * as path from 'path';
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import {Cdnjs} from '../assetManagers/cdnjs';
import {Github} from '../assetManagers/github';
import {Exclude, Type} from 'class-transformer';
import {IsDefined, Validate, ValidateNested} from 'class-validator';
import {AssetManager as AssetManager} from '../assetManagers/assetManager';
import {AssetManagerValidator as AssetManagerValidator} from '../assetManagers/assetManagerValidator';

export class Asset {
  @IsDefined()
  private name: string;
  /* c8 ignore start */
  public get _name(): string {
    return this.name;
  }
  public set _name(value: string) {
    this.name = value;
  }
  /* c8 ignore stop */

  @IsDefined()
  @Type(() => String)
  private localPath: PathLike;
  /* c8 ignore start */
  public get _localPath(): PathLike {
    return path.normalize(this.localPath.toString());
  }
  public set _localPath(value: PathLike) {
    this.localPath = value;
  }
  /* c8 ignore stop */

  @IsDefined()
  @ValidateNested()
  @Validate(AssetManagerValidator)
  @Type(() => AssetManager, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'name',
      subTypes: [
        {value: Cdnjs, name: 'cdnjs'},
        {value: Github, name: 'github'},
      ],
    },
  })
  private assetManager: AssetManager;
  /* c8 ignore start */
  public get _assetManager(): AssetManager {
    return this.assetManager;
  }
  public set _assetManager(value: AssetManager) {
    this.assetManager = value;
  }
  /* c8 ignore stop */

  private currentVersion?: string | undefined;
  /* c8 ignore start */
  public get _currentVersion(): string | undefined {
    return this.currentVersion;
  }
  public set _currentVersion(value: string | undefined) {
    this.currentVersion = value;
  }
  /* c8 ignore stop */

  @Exclude()
  private isUpdated = false;
  /* c8 ignore start */
  public get _isUpdated(): boolean {
    return this.isUpdated;
  }
  public set _isUpdated(value: boolean) {
    this.isUpdated = value;
  }
  /* c8 ignore stop */

  setToLatestVersion(): Promise<boolean> {
    return this.assetManager
      .getLatestVersion()
      .then((latestVersion: string) => {
        this.currentVersion = latestVersion;
        this.isUpdated = true;
        return Promise.resolve(this.isUpdated);
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  bumpToLatestVersion(force = false): Promise<Asset> {
    return this.assetManager
      .getLatestVersion()
      .then((latestVersion: string) => {
        if (latestVersion === this.currentVersion && !force) {
          this.isUpdated = false;
          return Promise.resolve(this);
        } else {
          return this.assetManager
            .getContent(latestVersion)
            .then(assetContent => {
              return fs
                .access(this.localPath, fs.constants.W_OK)
                .then(() => {
                  return fs
                    .readFile(this.localPath, 'base64')
                    .then(localData => {
                      if (assetContent.toString('base64') !== localData) {
                        return Promise.reject();
                      } else {
                        return Promise.resolve();
                      }
                    });
                })
                .catch(() => {
                  return fs.outputFile(
                    this.localPath.toString(),
                    assetContent,
                    {
                      flag: 'w',
                    }
                  );
                });
            })
            .then(() => {
              this.currentVersion = latestVersion;
              this.isUpdated = true;
              return Promise.resolve(this);
            });
        }
      })
      .catch((error: Error) => {
        throw error;
      });
  }
}
