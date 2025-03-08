/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import * as path from 'path';
import 'reflect-metadata';
import {Cdnjs} from '../../../src/model/assetManagers/cdnjs';
import {BmycError} from '../../../src/model/bmycError';
import {ConfigurationError} from '../../../src/model/configurationError';
import {deserializeObject} from '../../../src/utils/helpers';
import {testResourcesPath} from '../../testUtils/const';
import {setChaiAsPromised} from '../../testUtils/helpers';

const CDNJS_SAMPLE_UNEXISTING_FILE: PathLike = path.join(
  testResourcesPath,
  'cdnjs-sample-unexisting-file.json',
);
const CDNJS_SAMPLE_UNEXISTING_LIBRARY: PathLike = path.join(
  testResourcesPath,
  'cdnjs-sample-unexisting-library.json',
);
const CDNJS_SAMPLE_VALID: PathLike = path.join(
  testResourcesPath,
  'cdnjs-sample-valid.json',
);

describe('Cdnjs AssetManager tests', () => {
  it('Cdnjs should implement getLatestVersion', async () => {
    const cdnjs: Cdnjs = new Cdnjs();
    const {expect} = await import('chai');
    expect(cdnjs.getLatestVersion).to.be.instanceof(Function);
  });
  it('Cdnjs should implement getContent', async () => {
    const cdnjs: Cdnjs = new Cdnjs();
    const {expect} = await import('chai');
    expect(cdnjs.getContent).to.be.instanceof(Function);
  });
  it('Cdnjs should throw a ConfigurationError when name not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Cdnjs);
    }).to.throw(ConfigurationError);
  });
  it('Cdnjs should throw a ConfigurationError when library not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.library;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Cdnjs);
    }).to.throw(ConfigurationError);
  });
  it('Cdnjs should throw a ConfigurationError when fileName not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.fileName;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Cdnjs);
    }).to.throw(ConfigurationError);
  });
  it('getLatestVersion should return the latest version', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8');
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    const {expect} = await import('chai');
    await expect(cdnjs.getLatestVersion()).to.eventually.match(
      /^[0-9]+\.[0-9]+\.[0-9]+([.-][a-zA-Z0-9]+)*$/,
    );
  });
  it('getLatestVersion should throw a Error when unexisting library', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      CDNJS_SAMPLE_UNEXISTING_LIBRARY,
      'utf8',
    );
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    const {expect} = await import('chai');
    await expect(cdnjs.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404',
    );
  });
  it('getContent should return the latest content', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8');
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    const {expect} = await import('chai');
    return cdnjs.getLatestVersion().then(async latestVersion => {
      const content = await cdnjs.getContent(latestVersion);
      expect(content).to.not.be.empty;
    });
  });
  it('getContent should throw a BmycError when unexisting file', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(CDNJS_SAMPLE_UNEXISTING_FILE, 'utf8');
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    const {expect} = await import('chai');
    return cdnjs.getLatestVersion().then(async latestVersion => {
      await expect(
        cdnjs.getContent(latestVersion),
      ).to.eventually.be.rejectedWith(BmycError);
    });
  });
});
