/* eslint-disable @typescript-eslint/no-explicit-any*/
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {BmycError} from '../../../src/model/bmycError';
import {setChaiAsPromised} from '../../testUtils/helpers';
import {deserializeObject} from '../../../src/utils/helpers';
import {Github} from '../../../src/model/assetManagers/github';
import {rootPath, testResourcesPath} from '../../testUtils/const';
import {ConfigurationError} from '../../../src/model/configurationError';

const tempToken = process.env.GITHUB_TOKEN;
const GITHUB_SAMPLE_DIRECTORY: PathLike = path.join(
  testResourcesPath,
  'github-sample-directory.json'
);
const GITHUB_SAMPLE_EMPTY: PathLike = path.join(
  testResourcesPath,
  'github-sample-empty.json'
);
const GITHUB_SAMPLE_NO_TAGS: PathLike = path.join(
  testResourcesPath,
  'github-sample-no-tags.json'
);
const GITHUB_SAMPLE_PARENT_AS_FILE: PathLike = path.join(
  testResourcesPath,
  'github-sample-parent-as-file.json'
);
const GITHUB_SAMPLE_UNEXISTING_FILE: PathLike = path.join(
  testResourcesPath,
  'github-sample-unexisting-file.json'
);
const GITHUB_SAMPLE_UNEXISTING_REPO: PathLike = path.join(
  testResourcesPath,
  'github-sample-unexisting-repo.json'
);
const GITHUB_SAMPLE_VALID: PathLike = path.join(
  testResourcesPath,
  'github-sample-valid.json'
);

describe('GitHub AssetManager tests', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = tempToken;
  });
  it('GitHub should implement getLatestVersion', () => {
    const github: Github = new Github();
    expect(github.getLatestVersion).to.be.instanceof(Function);
  });
  it('GitHub should implement getContent', () => {
    const github: Github = new Github();
    expect(github.getContent).to.be.instanceof(Function);
  });
  it('GitHub without name field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('GitHub without owner field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.owner;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('GitHub without repository field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.repository;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('GitHub without filePath field should throw a ConfigurationError', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8')
    );
    delete tempInput.filePath;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('getLatestVersion without GITHUB_TOKEN environment variable should throw a BmycError', () => {
    setChaiAsPromised();
    delete process.env.GITHUB_TOKEN;
    const input: string = fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return expect(github.getLatestVersion()).to.eventually.be.rejectedWith(
      BmycError
    );
  });
  it('getContent without GITHUB_TOKEN environment variable should throw a BmycError', () => {
    setChaiAsPromised();
    delete process.env.GITHUB_TOKEN;
    const input: string = fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return expect(github.getContent('')).to.eventually.be.rejectedWith(
      BmycError
    );
  });
  it('getLatestVersion on an unexisting repo should throw a Error', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      GITHUB_SAMPLE_UNEXISTING_REPO,
      'utf8'
    );
    const github: Github = deserializeObject(input, Github);
    return expect(github.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it('getLatestVersion on a repository without tags should throw a Error', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_NO_TAGS, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return expect(github.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it('getLatestVersion on a valid AssetManager should return the latest version', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return expect(github.getLatestVersion()).to.eventually.match(
      /^[0-9]+\.[0-9]+\.[0-9]+$/
    );
  });
  it('getContent on a valid GitHub should return the latest content', () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8')
    );
    const input: any = JSON.stringify(tempInput);
    const github: Github = deserializeObject(input, Github);
    return github.getLatestVersion().then(latestVersion => {
      expect(github.getContent(latestVersion)).to.eventually.equal(
        fs.readFileSync(path.join(rootPath, tempInput.filePath), 'utf8')
      );
    });
  });
  it('getContent on an unexisting file which parent is a file should throw a BmycError', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_PARENT_AS_FILE, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return github.getLatestVersion().then(latestVersion => {
      expect(github.getContent(latestVersion)).to.eventually.be.rejectedWith(
        BmycError
      );
    });
  });
  it('getContent on an unexisting file should throw a BmycError', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      GITHUB_SAMPLE_UNEXISTING_FILE,
      'utf8'
    );
    const github: Github = deserializeObject(input, Github);
    return github.getLatestVersion().then(latestVersion => {
      expect(github.getContent(latestVersion)).to.eventually.be.rejectedWith(
        BmycError
      );
    });
  });
  it('getContent on a directory should throw a BmycError', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_DIRECTORY, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return github.getLatestVersion().then(latestVersion => {
      expect(github.getContent(latestVersion)).to.eventually.be.rejectedWith(
        BmycError
      );
    });
  });
  it('getContent on an empty file should throw a BmycError', () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_EMPTY, 'utf8');
    const github: Github = deserializeObject(input, Github);
    return github.getLatestVersion().then(latestVersion => {
      expect(github.getContent(latestVersion)).to.eventually.be.rejectedWith(
        BmycError
      );
    });
  });
});
