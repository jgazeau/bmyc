/* eslint-disable @typescript-eslint/no-unused-vars */
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {ArrayUnique} from 'class-validator';
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import * as path from 'path';
import {checkFilePath, validateClassObjectSync} from '../../utils/helpers';
import {Asset} from './asset';

export class Configuration {
  private filePath: PathLike;
  /* c8 ignore start */
  public get _filePath(): PathLike {
    return path.normalize(this.filePath.toString());
  }
  public set _filePath(value: PathLike) {
    this.filePath = value;
  }
  /* c8 ignore stop */

  @ArrayUnique((asset: Asset) => asset._package + asset._name)
  private assets: Asset[];
  /* c8 ignore start */
  public get _assets(): Asset[] {
    return this.assets;
  }
  public set _assets(value: Asset[]) {
    this.assets = value;
  }
  /* c8 ignore stop */

  constructor(filePath: PathLike) {
    //TODO implement YAML support
    this.filePath = checkFilePath(filePath);
    this.assets = deserializeFile(filePath);
    validateClassObjectSync(this);
  }

  save(): Promise<Configuration> {
    return fs
      .writeFile(
        this.filePath,
        JSON.stringify(instanceToPlain(this.assets), null, 2),
        {
          flag: 'w',
        }
      )
      .then(() => {
        return Promise.resolve(this);
      });
  }
}

function deserializeFile(filePath: PathLike): Asset[] {
  const assetsArray: Asset[] = JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  ).map((value: Asset) => plainToInstance(Asset, value));
  assetsArray.forEach((asset: Asset, i) => {
    validateClassObjectSync(asset, `Asset ${i}`, 'Configuration');
  });
  return assetsArray;
}
