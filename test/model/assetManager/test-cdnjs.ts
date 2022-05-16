/* eslint-disable @typescript-eslint/no-explicit-any*/
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {BmycError} from '../../../src/model/bmycError';
import {testResourcesPath} from '../../testUtils/const';
import {setChaiAsPromised} from '../../testUtils/helpers';
import {deserializeObject} from '../../../src/utils/helpers';
import {Cdnjs} from '../../../src/model/assetManagers/cdnjs';
import {ConfigurationError} from '../../../src/model/configurationError';

const CDNJS_SAMPLE_UNEXISTING_FILE: PathLike = path.join(
  testResourcesPath,
  'cdnjs-sample-unexisting-file.json'
);
const CDNJS_SAMPLE_UNEXISTING_LIBRARY: PathLike = path.join(
  testResourcesPath,
  'cdnjs-sample-unexisting-library.json'
);
const CDNJS_SAMPLE_VALID: PathLike = path.join(
  testResourcesPath,
  'cdnjs-sample-valid.json'
);

describe('Cdnjs AssetManager tests', () => {
  it('Cdnjs should implement getLatestVersion', () => {
    const cdnjs: Cdnjs = new Cdnjs();
    expect(cdnjs.getLatestVersion).to.be.instanceof(Function);
  });
  it('Cdnjs should implement getContent', () => {
    const cdnjs: Cdnjs = new Cdnjs();
    expect(cdnjs.getContent).to.be.instanceof(Function);
  });
  it('Cdnjs without name field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Cdnjs);
    }).to.throw(ConfigurationError);
  });
  it('Cdnjs without library field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.library;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Cdnjs);
    }).to.throw(ConfigurationError);
  });
  it('Cdnjs without fileName field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.fileName;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Cdnjs);
    }).to.throw(ConfigurationError);
  });
  it('getLatestVersion on a valid Cdnjs should return the latest version', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8');
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    return expect(cdnjs.getLatestVersion()).to.eventually.match(
      /^[0-9]+\.[0-9]+\.[0-9]+([.-][a-zA-Z0-9]+)*$/
    );
  });
  it('getLatestVersion on unexisting library should throw a Error', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      CDNJS_SAMPLE_UNEXISTING_LIBRARY,
      'utf8'
    );
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    return expect(cdnjs.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it('getContent on a valid Cdnjs should return the latest content', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(CDNJS_SAMPLE_VALID, 'utf8');
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    return cdnjs.getLatestVersion().then(latestVersion => {
      return cdnjs.getContent(latestVersion).then(content => {
        expect(content).to.not.be.empty;
      });
    });
  });
  it('getContent on unexisting file should throw a BmycError', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(CDNJS_SAMPLE_UNEXISTING_FILE, 'utf8');
    const cdnjs: Cdnjs = deserializeObject(input, Cdnjs);
    return cdnjs.getLatestVersion().then(latestVersion => {
      expect(cdnjs.getContent(latestVersion)).to.eventually.be.rejectedWith(
        BmycError
      );
    });
  });
});
