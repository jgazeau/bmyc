/* eslint-disable @typescript-eslint/no-explicit-any*/
import {expect} from 'chai';
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import * as path from 'path';
import 'reflect-metadata';
import {Jsdelivr} from '../../../src/model/assetManagers/jsdelivr';
import {ConfigurationError} from '../../../src/model/configurationError';
import {deserializeObject} from '../../../src/utils/helpers';
import {testResourcesPath} from '../../testUtils/const';
import {setChaiAsPromised} from '../../testUtils/helpers';

const JSDELIVR_SAMPLE_UNEXISTING_CDN: PathLike = path.join(
  testResourcesPath,
  'jsdelivr-sample-unexisting-cdn.json'
);
const JSDELIVR_SAMPLE_UNEXISTING_PACKAGE: PathLike = path.join(
  testResourcesPath,
  'jsdelivr-sample-unexisting-package.json'
);
const JSDELIVR_SAMPLE_UNEXISTING_FILE: PathLike = path.join(
  testResourcesPath,
  'jsdelivr-sample-unexisting-file.json'
);
const JSDELIVR_SAMPLE_VALID: PathLike = path.join(
  testResourcesPath,
  'jsdelivr-sample-valid.json'
);

describe('Jsdelivr AssetManager tests', () => {
  it('Jsdelivr should implement getLatestVersion', () => {
    const jsdelivr: Jsdelivr = new Jsdelivr();
    expect(jsdelivr.getLatestVersion).to.be.instanceof(Function);
  });
  it('Jsdelivr should implement getContent', () => {
    const jsdelivr: Jsdelivr = new Jsdelivr();
    expect(jsdelivr.getContent).to.be.instanceof(Function);
  });
  it('Jsdelivr should throw a ConfigurationError when name not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(JSDELIVR_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Jsdelivr);
    }).to.throw(ConfigurationError);
  });
  it('Jsdelivr should throw a ConfigurationError when cdn not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(JSDELIVR_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.cdn;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Jsdelivr);
    }).to.throw(ConfigurationError);
  });
  it('Jsdelivr should throw a ConfigurationError when package not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(JSDELIVR_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.package;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Jsdelivr);
    }).to.throw(ConfigurationError);
  });
  it('Jsdelivr should throw a ConfigurationError when filePath not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(JSDELIVR_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.filePath;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Jsdelivr);
    }).to.throw(ConfigurationError);
  });
  it('getLatestVersion should return the latest version', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(JSDELIVR_SAMPLE_VALID, 'utf8');
    const jsdelivr: Jsdelivr = deserializeObject(input, Jsdelivr);
    return expect(jsdelivr.getLatestVersion()).to.eventually.match(
      /^[0-9]+\.[0-9]+\.[0-9]+([.-][a-zA-Z0-9]+)*$/
    );
  });
  it('getLatestVersion should throw a Error when unexisting cdn', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      JSDELIVR_SAMPLE_UNEXISTING_CDN,
      'utf8'
    );
    const jsdelivr: Jsdelivr = deserializeObject(input, Jsdelivr);
    return expect(jsdelivr.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '400'
    );
  });
  it('getLatestVersion should throw a Error when unexisting package', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      JSDELIVR_SAMPLE_UNEXISTING_PACKAGE,
      'utf8'
    );
    const jsdelivr: Jsdelivr = deserializeObject(input, Jsdelivr);
    return expect(jsdelivr.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it('getContent should return the latest content', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(JSDELIVR_SAMPLE_VALID, 'utf8');
    const jsdelivr: Jsdelivr = deserializeObject(input, Jsdelivr);
    return jsdelivr.getLatestVersion().then(latestVersion => {
      return jsdelivr.getContent(latestVersion).then(content => {
        expect(content).to.not.be.empty;
      });
    });
  });
  it('getContent should throw a Error when unexisting file', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      JSDELIVR_SAMPLE_UNEXISTING_FILE,
      'utf8'
    );
    const jsdelivr: Jsdelivr = deserializeObject(input, Jsdelivr);
    return jsdelivr.getLatestVersion().then(latestVersion => {
      return expect(
        jsdelivr.getContent(latestVersion)
      ).to.eventually.be.rejectedWith(Error, '404');
    });
  });
});
