import * as path from 'path';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {testResourcesPath} from '../testUtils/const';
import {Asset} from '../../src/model/configurationFile/asset';
import {ConfigurationError} from '../../src/model/configurationError';
import {
  BumpResultEntry,
  BumpResults,
  getStatus,
  getSummary,
} from '../../src/utils/stats';

function mockAsset(
  name: string,
  localPath: PathLike,
  currentVersion: string,
  isUpdated: boolean
): Asset {
  const asset = new Asset();
  asset._name = name;
  asset._localPath = localPath;
  asset._currentVersion = currentVersion;
  asset._isUpdated = isUpdated;
  return asset;
}

function mockResultEntry(asset: Asset, error?: Error): BumpResultEntry {
  return [
    getStatus(asset, error),
    asset._name,
    getSummary(asset, error),
    asset._currentVersion!,
  ];
}

const FAKE_ERROR: ConfigurationError = new ConfigurationError('Error occurred');
const FAKE_LOCALPATH: PathLike = path.join(testResourcesPath, 'fakePath.fake');
const FAKE_VERSION = 'X.X.X';

describe('Stats tests', () => {
  it('orderResults should order results from success to error', () => {
    BumpResults.results = [];
    const asset1 = mockAsset('asset1', FAKE_LOCALPATH, FAKE_VERSION, false);
    const asset2 = mockAsset('asset2', FAKE_LOCALPATH, FAKE_VERSION, false);
    const asset3 = mockAsset('asset3', FAKE_LOCALPATH, FAKE_VERSION, true);
    const asset4 = mockAsset('asset4', FAKE_LOCALPATH, FAKE_VERSION, false);
    const asset5 = mockAsset('asset5', FAKE_LOCALPATH, FAKE_VERSION, false);
    const asset6 = mockAsset('asset6', FAKE_LOCALPATH, FAKE_VERSION, true);
    const orderedAssets: BumpResultEntry[] = [
      mockResultEntry(asset3),
      mockResultEntry(asset6),
      mockResultEntry(asset1),
      mockResultEntry(asset4),
      mockResultEntry(asset2, FAKE_ERROR),
      mockResultEntry(asset5, FAKE_ERROR),
    ];
    BumpResults.storeResult(asset6);
    BumpResults.storeResult(asset5, FAKE_ERROR);
    BumpResults.storeResult(asset4);
    BumpResults.storeResult(asset3);
    BumpResults.storeResult(asset2, FAKE_ERROR);
    BumpResults.storeResult(asset1);
    BumpResults.orderResults();
    expect(BumpResults.results.toString()).to.equal(orderedAssets.toString());
  });
});
