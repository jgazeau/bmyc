/* eslint-disable @typescript-eslint/no-unused-vars */
import {IsDefined, IsString} from 'class-validator';
import {ConfigurationError} from '../configurationError';
import {IAssetManager} from './iAssetManager';

export abstract class AssetManager implements IAssetManager {
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

  getLatestVersion(): Promise<string> {
    throw new ConfigurationError('Method to be implemented.');
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  getContent(assetVersion: string): Promise<Buffer> {
    throw new ConfigurationError('Method to be implemented.');
  }
}
