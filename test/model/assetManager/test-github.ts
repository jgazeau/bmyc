/* eslint-disable @typescript-eslint/no-explicit-any*/

import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import * as path from 'path';
import 'reflect-metadata';
import {Github} from '../../../src/model/assetManagers/github';
import {BmycError} from '../../../src/model/bmycError';
import {ConfigurationError} from '../../../src/model/configurationError';
import {deserializeObject} from '../../../src/utils/helpers';
import {rootPath, testResourcesPath} from '../../testUtils/const';
import {setChaiAsPromised} from '../../testUtils/helpers';

const tempToken = process.env.BMYC_GITHUB_TOKEN;
const GITHUB_SAMPLE_DIRECTORY: PathLike = path.join(
  testResourcesPath,
  'github-sample-directory.json',
);
const GITHUB_SAMPLE_EMPTY: PathLike = path.join(
  testResourcesPath,
  'github-sample-empty.json',
);
const GITHUB_SAMPLE_NO_TAGS: PathLike = path.join(
  testResourcesPath,
  'github-sample-no-tags.json',
);
const GITHUB_SAMPLE_PARENT_AS_FILE: PathLike = path.join(
  testResourcesPath,
  'github-sample-parent-as-file.json',
);
const GITHUB_SAMPLE_UNEXISTING_FILE: PathLike = path.join(
  testResourcesPath,
  'github-sample-unexisting-file.json',
);
const GITHUB_SAMPLE_UNEXISTING_REPO: PathLike = path.join(
  testResourcesPath,
  'github-sample-unexisting-repo.json',
);
const GITHUB_SAMPLE_VALID: PathLike = path.join(
  testResourcesPath,
  'github-sample-valid.json',
);

describe('GitHub AssetManager tests', () => {
  beforeEach(() => {
    process.env.BMYC_GITHUB_TOKEN = tempToken;
  });
  it('GitHub should implement getLatestVersion', async () => {
    const github: Github = new Github();
    const {expect} = await import('chai');
    expect(github.getLatestVersion).to.be.instanceof(Function);
  });
  it('GitHub should implement getContent', async () => {
    const github: Github = new Github();
    const {expect} = await import('chai');
    expect(github.getContent).to.be.instanceof(Function);
  });
  it('GitHub should throw a ConfigurationError when name not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('GitHub should throw a ConfigurationError when owner not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.owner;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('GitHub should throw a ConfigurationError when repository not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.repository;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('GitHub should throw a ConfigurationError when filePath not set', async () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8'),
    );
    delete tempInput.filePath;
    const input: string = JSON.stringify(tempInput);
    const {expect} = await import('chai');
    expect(() => {
      deserializeObject(input, Github);
    }).to.throw(ConfigurationError);
  });
  it('getLatestVersion should throw a BmycError when BMYC_GITHUB_TOKEN not set', async () => {
    setChaiAsPromised();
    delete process.env.BMYC_GITHUB_TOKEN;
    const input: string = fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    await expect(github.getLatestVersion()).to.eventually.be.rejectedWith(
      BmycError,
    );
  });
  it('getContent should throw a BmycError when BMYC_GITHUB_TOKEN not set', async () => {
    setChaiAsPromised();
    delete process.env.BMYC_GITHUB_TOKEN;
    const input: string = fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    await expect(github.getContent('')).to.eventually.be.rejectedWith(
      BmycError,
    );
  });
  it('getLatestVersion should throw a Error when unexisting repo', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      GITHUB_SAMPLE_UNEXISTING_REPO,
      'utf8',
    );
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    await expect(github.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404',
    );
  });
  it('getLatestVersion should throw a Error when repository without tags', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_NO_TAGS, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    await expect(github.getLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404',
    );
  });
  it('getLatestVersion should return the latest version', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    await expect(github.getLatestVersion()).to.eventually.match(
      /^[0-9]+\.[0-9]+\.[0-9]+$/,
    );
  });
  it('getContent should return the latest content', async () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(GITHUB_SAMPLE_VALID, 'utf8'),
    );
    const input: any = JSON.stringify(tempInput);
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    return github.getLatestVersion().then(async latestVersion => {
      await github.getContent(latestVersion).then(content => {
        expect(content.toString('utf8')).to.equal(
          fs.readFileSync(path.join(rootPath, tempInput.filePath), 'utf8'),
        );
      });
    });
  });
  it('getContent should throw a BmycError when unexisting file which parent is a file', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_PARENT_AS_FILE, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    return github.getLatestVersion().then(async latestVersion => {
      await expect(
        github.getContent(latestVersion),
      ).to.eventually.be.rejectedWith(BmycError);
    });
  });
  it('getContent should throw a BmycError when unexisting file', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(
      GITHUB_SAMPLE_UNEXISTING_FILE,
      'utf8',
    );
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    return github.getLatestVersion().then(async latestVersion => {
      await expect(
        github.getContent(latestVersion),
      ).to.eventually.be.rejectedWith(BmycError);
    });
  });
  it('getContent should throw a BmycError when directory', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_DIRECTORY, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    return github.getLatestVersion().then(async latestVersion => {
      await expect(
        github.getContent(latestVersion),
      ).to.eventually.be.rejectedWith(BmycError);
    });
  });
  it('getContent should throw a BmycError when empty file', async () => {
    setChaiAsPromised();
    const input: string = fs.readFileSync(GITHUB_SAMPLE_EMPTY, 'utf8');
    const github: Github = deserializeObject(input, Github);
    const {expect} = await import('chai');
    return github.getLatestVersion().then(async latestVersion => {
      await expect(
        github.getContent(latestVersion),
      ).to.eventually.be.rejectedWith(BmycError);
    });
  });
});
