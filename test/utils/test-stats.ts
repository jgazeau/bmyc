import * as path from 'path';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {testResourcesPath} from '../../testUtils/const';
import {Asset} from '../../src/model/configurationFile/asset';
import {ConfigurationError} from '../../src/model/configurationError';
import {
  BumpResultEntry,
  BumpResults,
  getStatus,
  getSummary,
} from '../../src/utils/stats';

function mockAsset(
  packageName: string,
  name: string,
  hold: boolean,
  localPath: PathLike,
  currentVersion: string,
  isUpdated: boolean,
  isNewVersion: boolean
): Asset {
  const asset = new Asset();
  asset._package = packageName;
  asset._name = name;
  asset._hold = hold;
  asset._localPath = localPath;
  asset._currentVersion = currentVersion;
  asset._isUpdated = isUpdated;
  asset._isNewVersion = isNewVersion;
  return asset;
}

function mockResultEntry(asset: Asset, error?: Error): BumpResultEntry {
  return [
    asset._package,
    asset._name,
    getSummary(asset, error),
    asset._currentVersion!,
    getStatus(asset, error),
  ];
}

const FAKE_ERROR: ConfigurationError = new ConfigurationError('Error occurred');
const FAKE_LOCALPATH: PathLike = path.join(testResourcesPath, 'fakePath.fake');
const FAKE_VERSION = 'X.X.X';

describe('Stats tests', () => {
  it('orderResults should order results from success to error', () => {
    BumpResults.results = [];
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
      false
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
    const orderedAssets: BumpResultEntry[] = [
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
    BumpResults.storeResult(asset12);
    BumpResults.storeResult(asset11);
    BumpResults.storeResult(asset10);
    BumpResults.storeResult(asset9);
    BumpResults.storeResult(asset8);
    BumpResults.storeResult(asset7);
    BumpResults.storeResult(asset6, FAKE_ERROR);
    BumpResults.storeResult(asset5);
    BumpResults.storeResult(asset4);
    BumpResults.storeResult(asset3);
    BumpResults.storeResult(asset2, FAKE_ERROR);
    BumpResults.storeResult(asset1);
    BumpResults.orderResults();
    expect(BumpResults.results.toString()).to.equal(orderedAssets.toString());
  });
});
