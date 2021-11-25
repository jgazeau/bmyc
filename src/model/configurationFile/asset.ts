import * as path from 'path';
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import {Cdnjs} from '../assetManagers/cdnjs';
import {Github} from '../assetManagers/github';
import {Exclude, Type} from 'class-transformer';
import {AssetManager as AssetManager} from '../assetManagers/assetManager';
import {AssetManagerValidator as AssetManagerValidator} from '../assetManagers/assetManagerValidator';
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';

export class Asset {
  @IsOptional()
  @IsString()
  private package = '';
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
  private name: string;
  /* c8 ignore start */
  public get _name(): string {
    return this.name;
  }
  public set _name(value: string) {
    this.name = value;
  }
  /* c8 ignore stop */

  @IsOptional()
  @IsBoolean()
  private hold = false;
  /* c8 ignore start */
  public get _hold(): boolean {
    return this.hold;
  }
  public set _hold(value: boolean) {
    this.hold = value;
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
  private latestVersion?: string | undefined;
  /* c8 ignore start */
  public get _latestVersion(): string | undefined {
    return this.latestVersion;
  }
  public set _latestVersion(value: string | undefined) {
    this.latestVersion = value;
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

  @Exclude()
  private isNewVersion = false;
  /* c8 ignore start */
  public get _isNewVersion(): boolean {
    return this.isNewVersion;
  }
  public set _isNewVersion(value: boolean) {
    this.isNewVersion = value;
  }
  /* c8 ignore stop */

  /*
   * Set asset to the latest available version.
   * This function is used mainly for tests.
   */
  setToLatestVersion(): Promise<boolean> {
    return this.assetManager
      .getLatestVersion()
      .then((latestVersion: string) => {
        this.latestVersion = latestVersion;
        this.currentVersion = latestVersion;
        this.isUpdated = true;
        return Promise.resolve(this.isUpdated);
      });
  }

  /*
   * Bump asset to the latest available version.
   */
  bumpToLatestVersion(force = false): Promise<Asset> {
    return this.assetManager
      .getLatestVersion()
      .then((latestVersion: string) => {
        this.latestVersion = latestVersion;
        this.isNewVersion = latestVersion !== this.currentVersion;
        if ((!this.isNewVersion && !force) || this.hold) {
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
      });
  }
}
