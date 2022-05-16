import * as path from 'path';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {logger} from '../../src/utils/logger';
import {SinonStubs} from '../testUtils/sinonStubs';
import {testResourcesPath} from '../testUtils/const';
import {Asset} from '../../src/model/configurationFile/asset';
import {ConfigurationError} from '../../src/model/configurationError';
import {
  ResultEntry,
  PrintResults,
  getStatus,
  getSummary,
  PrintEntry,
  getAssetVersion,
} from '../../src/utils/stats';

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

const FAKE_ERROR: ConfigurationError = new ConfigurationError('Error occurred');
const FAKE_LOCALPATH: PathLike = path.join(testResourcesPath, 'fakePath.fake');
const FAKE_VERSION = 'X.X.X';

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
    PrintResults.results = [];
    PrintResults.table = [];
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
  it('printResults should display results', () => {
    sinonMock.logger = true;
    sinonMock.sinonSetStubs();
    PrintResults.printResults();
    expect(logger()['info']).to.be.calledOnce;
  });
});
