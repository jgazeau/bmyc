import {expect} from 'chai';
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import * as path from 'path';
import {BmycError} from '../../src/model/bmycError';
import {Asset} from '../../src/model/configurationFile/asset';
import {NOT_AVAILABLE, SUMMARY_PR_NOT_GENERATED} from '../../src/utils/const';
import {logger} from '../../src/utils/logger';
import {
  HELD,
  PrintEntry,
  PrintResults,
  ResultEntry,
  STATUS_ERROR,
  STATUS_UPDATED,
  STATUS_UPTODATE,
  getAssetVersion,
  getStatus,
  getSummary,
} from '../../src/utils/stats';
import {
  TEST_SUMMARY_PR_FILE_NAME,
  TEST_SUMMARY_PR_FILE_PATH,
  testResourcesPath,
} from '../testUtils/const';
import {cleanupPrintResults, setChaiAsPromised} from '../testUtils/helpers';
import {SinonStubs} from '../testUtils/sinonStubs';

function mockAsset(
  packageName: string,
  name: string,
  hold: boolean,
  localPath: PathLike,
  currentVersion: string,
  isUpdated: boolean,
  isNewVersion: boolean,
  latestVersion?: string
): Asset {
  const asset = new Asset();
  asset._package = packageName;
  asset._name = name;
  asset._hold = hold;
  asset._localPath = localPath;
  asset._currentVersion = currentVersion;
  asset._latestVersion = latestVersion;
  asset._isUpdated = isUpdated;
  asset._isNewVersion = isNewVersion;
  return asset;
}

function mockResultEntry(asset: Asset, error?: Error): ResultEntry {
  return [
    new PrintEntry(asset._package),
    new PrintEntry(asset._name),
    new PrintEntry(getSummary(asset, error)),
    new PrintEntry(getAssetVersion(asset)),
    getStatus(asset, error),
  ];
}

const FAKE_ERROR: BmycError = new BmycError('[ASSET_URL]:<br>Error occurred');
const FAKE_LOCALPATH: PathLike = 'fakePath.fake';
const FAKE_VERSION = 'X.X.X';
const TEST_SUMMARY_PR_FILE: PathLike = path.join(
  testResourcesPath,
  TEST_SUMMARY_PR_FILE_NAME
);

const asset1 = mockAsset(
  'package1',
  'asset1',
  true,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  false
);
const asset2 = mockAsset(
  'package1',
  'asset2',
  true,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  true
);
const asset3 = mockAsset(
  'package1',
  'asset3',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  true,
  false
);
const asset4 = mockAsset(
  'package1',
  'asset4',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  false
);
const asset5 = mockAsset(
  'package1',
  'asset5',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  false
);
const asset6 = mockAsset(
  'package2',
  'asset6',
  true,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  true
);
const asset7 = mockAsset(
  'package2',
  'asset7',
  true,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  true,
  'Y.Y.Y'
);
const asset8 = mockAsset(
  'package2',
  'asset8',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  true,
  false
);
const asset9 = mockAsset(
  'package2',
  'asset9',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  true
);
const asset10 = mockAsset(
  'package2',
  'asset10',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  true
);
const asset11 = mockAsset(
  '',
  'asset11',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  false
);
const asset12 = mockAsset(
  '',
  'asset12',
  false,
  FAKE_LOCALPATH,
  FAKE_VERSION,
  false,
  false
);

const orderedResults: ResultEntry[] = [
  mockResultEntry(asset11),
  mockResultEntry(asset12),
  mockResultEntry(asset1),
  mockResultEntry(asset3),
  mockResultEntry(asset4),
  mockResultEntry(asset5),
  mockResultEntry(asset2, FAKE_ERROR),
  mockResultEntry(asset7),
  mockResultEntry(asset8),
  mockResultEntry(asset10),
  mockResultEntry(asset9),
  mockResultEntry(asset6, FAKE_ERROR),
];

describe('Stats tests', () => {
  const sinonMock = new SinonStubs({});
  beforeEach(() => {
    cleanupPrintResults();
    PrintResults.storeResult(asset12);
    PrintResults.storeResult(asset11);
    PrintResults.storeResult(asset10);
    PrintResults.storeResult(asset9);
    PrintResults.storeResult(asset8);
    PrintResults.storeResult(asset7);
    PrintResults.storeResult(asset6, FAKE_ERROR);
    PrintResults.storeResult(asset5);
    PrintResults.storeResult(asset4);
    PrintResults.storeResult(asset3);
    PrintResults.storeResult(asset2, FAKE_ERROR);
    PrintResults.storeResult(asset1);
  });
  afterEach(() => {
    sinonMock.sinonRestoreStubs();
  });
  it('orderResults should order results', () => {
    PrintResults.orderResults();
    expect(PrintResults.results.toString()).to.equal(orderedResults.toString());
  });
  it('manageResults should display results', () => {
    sinonMock.logger = true;
    sinonMock.sinonSetStubs();
    setChaiAsPromised();
    return PrintResults.manageResults().then(() => {
      expect(logger()['info']).to.be.calledOnce;
    });
  });
  it('manageResults should display info message when no asset updated', () => {
    sinonMock.logger = true;
    sinonMock.sinonSetStubs();
    setChaiAsPromised();
    cleanupPrintResults();
    return PrintResults.manageResults(TEST_SUMMARY_PR_FILE_NAME).then(() => {
      expect(logger()['info']).to.be.calledTwice;
      expect(logger()['info']).to.have.been.calledWith(
        SUMMARY_PR_NOT_GENERATED
      );
    });
  });
  it('manageResults should store results when summary PR file', () => {
    sinonMock.logger = true;
    sinonMock.sinonSetStubs();
    setChaiAsPromised();
    return PrintResults.manageResults(TEST_SUMMARY_PR_FILE_PATH).then(() => {
      return fs
        .readFile(TEST_SUMMARY_PR_FILE_PATH, 'utf8')
        .then(summaryContent => {
          return fs
            .readFile(TEST_SUMMARY_PR_FILE, 'utf8')
            .then(originContent => {
              expect(originContent).to.be.equal(summaryContent);
            });
        });
    });
  });
  it('totals should add totals', () => {
    PrintResults.totals();
    expect(PrintResults.table).to.have.length(6);
  });
  it('getStatus should return STATUS_ERROR', () => {
    const asset = new Asset();
    const error = new Error();
    expect(getStatus(asset, error)).to.equal(STATUS_ERROR);
  });
  it('getStatus should return STATUS_UPDATED', () => {
    const asset = new Asset();
    asset._isUpdated = true;
    expect(getStatus(asset)).to.equal(STATUS_UPDATED);
  });
  it('getStatus should return STATUS_UPTODATE', () => {
    const asset = new Asset();
    asset._isUpdated = false;
    expect(getStatus(asset)).to.equal(STATUS_UPTODATE);
  });
  it('getStatus should return HELD_OUTDATED', () => {
    const asset = new Asset();
    asset._isUpdated = false;
    asset._hold = true;
    asset._isNewVersion = true;
    expect(getStatus(asset)).to.deep.equal(HELD(true));
  });
  it('getStatus should return HELD_UPTODATE', () => {
    const asset = new Asset();
    asset._isUpdated = false;
    asset._hold = true;
    asset._isNewVersion = false;
    expect(getStatus(asset)).to.deep.equal(HELD(false));
  });
  it('getAssetVersion should return current and updated version when updated', () => {
    const asset = new Asset();
    const beforeUpdateVersion = '0.0.0';
    const latestVersion = '0.0.1';
    asset._beforeUpdateVersion = beforeUpdateVersion;
    asset._latestVersion = latestVersion;
    asset._isUpdated = true;
    expect(getAssetVersion(asset)).to.equal(
      `${beforeUpdateVersion} --> ${latestVersion}`
    );
  });
  it('getAssetVersion should return current and updated version when hold', () => {
    const asset = new Asset();
    const beforeUpdateVersion = '0.0.0';
    const latestVersion = '0.0.1';
    asset._beforeUpdateVersion = beforeUpdateVersion;
    asset._latestVersion = latestVersion;
    asset._hold = true;
    expect(getAssetVersion(asset)).to.equal(
      `${beforeUpdateVersion} --> ${latestVersion}`
    );
  });
  it('getAssetVersion should return latest version', () => {
    const asset = new Asset();
    const latestVersion = '0.0.1';
    asset._latestVersion = latestVersion;
    asset._isUpdated = false;
    asset._hold = false;
    expect(getAssetVersion(asset)).to.equal(`${latestVersion}`);
  });
  it('getAssetVersion should return current version', () => {
    const asset = new Asset();
    const currentVersion = '0.0.1';
    asset._currentVersion = currentVersion;
    expect(getAssetVersion(asset)).to.equal(`${currentVersion}`);
  });
  it('getAssetVersion should return unknown version', () => {
    const asset = new Asset();
    expect(getAssetVersion(asset)).to.equal(NOT_AVAILABLE);
  });
});
