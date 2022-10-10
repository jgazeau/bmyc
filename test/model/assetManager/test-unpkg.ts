/* eslint-disable @typescript-eslint/no-explicit-any*/
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {testResourcesPath} from '../../testUtils/const';
import {setChaiAsPromised} from '../../testUtils/helpers';
import {Unpkg} from '../../../src/model/assetManagers/unpkg';
import {deserializeObject} from '../../../src/utils/helpers';
import {ConfigurationError} from '../../../src/model/configurationError';

const UNPKG_SAMPLE_UNEXISTING_FILE: PathLike = path.join(
  testResourcesPath,
  'unpkg-sample-unexisting-file.json'
);
const UNPKG_SAMPLE_UNEXISTING_LIBRARY: PathLike = path.join(
  testResourcesPath,
  'unpkg-sample-unexisting-library.json'
);
const UNPKG_SAMPLE_VALID: PathLike = path.join(
  testResourcesPath,
  'unpkg-sample-valid.json'
);

describe('Unpkg AssetManager tests', () => {
  it('Unpkg should implement getLatestVersion', () => {
    const unpkg: Unpkg = new Unpkg();
    expect(unpkg.getLatestVersion).to.be.instanceof(Function);
  });
  it('Unpkg should implement getContent', () => {
    const unpkg: Unpkg = new Unpkg();
    expect(unpkg.getContent).to.be.instanceof(Function);
  });
  it('Unpkg should throw a ConfigurationError when name not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(UNPKG_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Unpkg);
    }).to.throw(ConfigurationError);
  });
  it('Unpkg should throw a ConfigurationError when library not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(UNPKG_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.library;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Unpkg);
    }).to.throw(ConfigurationError);
  });
  it('Unpkg should throw a ConfigurationError when filePath not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(UNPKG_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.filePath;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Unpkg);
    }).to.throw(ConfigurationError);
  });
  it('getLatestVersion should return the latest version', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(UNPKG_SAMPLE_VALID, 'utf8');
    const unpkg: Unpkg = deserializeObject(input, Unpkg);
    return expect(unpkg.getLatestVersion()).to.eventually.match(
      /^[0-9]+\.[0-9]+\.[0-9]+([.-][a-zA-Z0-9]+)*$/
    );
  });
  it('getLatestVersion should throw a Error when unexisting library', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      UNPKG_SAMPLE_UNEXISTING_LIBRARY,
      'utf8'
    );
    const unpkg: Unpkg = deserializeObject(input, Unpkg);
    return expect(unpkg.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it('getContent should return the latest content', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(UNPKG_SAMPLE_VALID, 'utf8');
    const unpkg: Unpkg = deserializeObject(input, Unpkg);
    return unpkg.getLatestVersion().then(latestVersion => {
      return unpkg.getContent(latestVersion).then(content => {
        expect(content).to.not.be.empty;
      });
    });
  });
  it('getContent should throw a Error when unexisting file', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(UNPKG_SAMPLE_UNEXISTING_FILE, 'utf8');
    const unpkg: Unpkg = deserializeObject(input, Unpkg);
    return unpkg.getLatestVersion().then(latestVersion => {
      return expect(
        unpkg.getContent(latestVersion)
      ).to.eventually.be.rejectedWith(Error, '404');
    });
  });
});
