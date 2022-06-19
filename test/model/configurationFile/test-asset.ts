/* eslint-disable @typescript-eslint/no-explicit-any*/
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {version} from '../../../package.json';
import {FORCE_OPTION} from '../../../src/utils/const';
import {setChaiAsPromised} from '../../testUtils/helpers';
import {deserializeObject} from '../../../src/utils/helpers';
import {Github} from '../../../src/model/assetManagers/github';
import {Asset} from '../../../src/model/configurationFile/asset';
import {rootPath, testResourcesPath} from '../../testUtils/const';
import {ConfigurationError} from '../../../src/model/configurationError';
import {AssetManager} from '../../../src/model/assetManagers/assetManager';

const ASSET_SAMPLE_INCORRECT_ASSET_MANAGER: PathLike = path.join(
  testResourcesPath,
  'asset-sample-incorrect-asset-manager.json'
);
const ASSET_SAMPLE_VALID_HElD: PathLike = path.join(
  testResourcesPath,
  'asset-sample-valid-held.json'
);
const ASSET_SAMPLE_VALID_LATEST: PathLike = path.join(
  testResourcesPath,
  'asset-sample-valid-latest.json'
);
const ASSET_SAMPLE_VALID_OUTDATED: PathLike = path.join(
  testResourcesPath,
  'asset-sample-valid-outdated.json'
);
const ASSET_SAMPLE_VALID_UNEXISTING: PathLike = path.join(
  testResourcesPath,
  'asset-sample-valid-unexisting.json'
);

describe('Asset tests', () => {
  it('Asset should throw a ConfigurationError when name not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8')
    );
    delete tempInput.name;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Asset);
    }).to.throw(ConfigurationError);
  });
  it('Asset should throw a ConfigurationError when localPath not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8')
    );
    delete tempInput.localPath;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Asset);
    }).to.throw(ConfigurationError);
  });
  it('Asset should throw a ConfigurationError when assetManager not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8')
    );
    delete tempInput.assetManager;
    const input: string = JSON.stringify(tempInput);
    expect(() => {
      deserializeObject(input, Asset);
    }).to.throw(ConfigurationError);
  });
  it('Asset should parse a correct Asset when currentVersion not set', () => {
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8')
    );
    delete tempInput.currentVersion;
    const asset: Asset = deserializeObject(JSON.stringify(tempInput), Asset);
    expect(asset._name).to.be.a('string');
    expect(asset._localPath).to.be.a('string');
    expect(asset._assetManager).to.be.an.instanceof(AssetManager);
  });
  it('Asset should parse a correct Asset when valid sample', () => {
    const asset: Asset = deserializeObject(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8'),
      Asset
    );
    expect(asset._name).to.be.a('string');
    expect(asset._localPath).to.be.a('string');
    expect(asset._assetManager).to.be.an.instanceof(AssetManager);
    expect(asset._currentVersion).to.be.a('string');
  });
  it('setToLatestVersion should throw a Error when incorrect asset', () => {
    setChaiAsPromised();
    const asset: Asset = deserializeObject(
      fs.readFileSync(ASSET_SAMPLE_INCORRECT_ASSET_MANAGER, 'utf8'),
      Asset
    );
    return expect(asset.setToLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it('setToLatestVersion should return true and update Asset', () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8')
    );
    tempInput.currentVersion = version;
    const asset: Asset = deserializeObject(JSON.stringify(tempInput), Asset);
    return asset.setToLatestVersion().then(isUpdated => {
      expect(isUpdated).to.be.true;
      expect(asset._currentVersion).to.be.equal(version);
    });
  });
  it('bumpToLatestVersion should return asset with isUpdated false when latest asset', () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_LATEST, 'utf8')
    );
    tempInput.currentVersion = version;
    const asset: Asset = deserializeObject(JSON.stringify(tempInput), Asset);
    return asset.bumpToLatestVersion().then(tempAsset => {
      expect(tempAsset._isUpdated).to.be.false;
    });
  });
  it('bumpToLatestVersion should return asset with isUpdated true and update current version when latest asset without current version', () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_LATEST, 'utf8')
    );
    delete tempInput.currentVersion;
    const asset: Asset = deserializeObject(JSON.stringify(tempInput), Asset);
    return asset.bumpToLatestVersion().then(tempAsset => {
      expect(tempAsset._isUpdated).to.be.true;
      expect(tempAsset._currentVersion).to.not.be.empty;
    });
  });
  it('bumpToLatestVersion should return asset with isNewVersion true and isUpdated false when held and outdated asset', () => {
    setChaiAsPromised();
    const asset: Asset = deserializeObject(
      fs.readFileSync(ASSET_SAMPLE_VALID_HElD, 'utf8'),
      Asset
    );
    return asset.bumpToLatestVersion().then(tempAsset => {
      expect(tempAsset._isNewVersion).to.be.true;
      expect(tempAsset._isUpdated).to.be.false;
    });
  });
  it('bumpToLatestVersion should return asset with isNewVersion true and isUpdated false when held and up-to-date asset', () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_HElD, 'utf8')
    );
    tempInput.currentVersion = version;
    const asset: Asset = deserializeObject(JSON.stringify(tempInput), Asset);
    return asset.bumpToLatestVersion().then(tempAsset => {
      expect(tempAsset._isNewVersion).to.be.false;
      expect(tempAsset._isUpdated).to.be.false;
    });
  });
  it('bumpToLatestVersion should return asset with isUpdated true and update asset content when outdated asset', () => {
    setChaiAsPromised();
    const asset: Asset = deserializeObject(
      fs.readFileSync(ASSET_SAMPLE_VALID_OUTDATED, 'utf8'),
      Asset
    );
    return fs
      .rm(asset._localPath, {force: true})
      .then(() => {
        return fs.ensureFile(asset._localPath.toString());
      })
      .then(() => {
        return fs.readFile(asset._localPath, 'utf8').then(initialContent => {
          expect(initialContent).to.be.empty;
        });
      })
      .then(() => {
        return asset
          .bumpToLatestVersion()
          .then(tempAsset => {
            expect(tempAsset._isUpdated).to.be.true;
          })
          .then(() => {
            return fs
              .readFile(asset._localPath, 'utf8')
              .then(updatedContent => {
                return fs
                  .readFile(
                    path.join(
                      rootPath,
                      (asset._assetManager as Github)._filePath
                    ),
                    'utf8'
                  )
                  .then(initialContent => {
                    expect(initialContent).to.equal(updatedContent);
                  });
              });
          });
      });
  });
  it('bumpToLatestVersion should return asset with isUpdated true and create asset when unexisting asset', () => {
    setChaiAsPromised();
    const asset: Asset = deserializeObject(
      fs.readFileSync(ASSET_SAMPLE_VALID_UNEXISTING, 'utf8'),
      Asset
    );
    return fs.rm(asset._localPath, {force: true}).then(() => {
      return asset
        .bumpToLatestVersion()
        .then(tempAsset => {
          expect(tempAsset._isUpdated).to.be.true;
        })
        .then(() => {
          return fs.readFile(asset._localPath, 'utf8').then(updatedContent => {
            return fs
              .readFile(
                path.join(rootPath, (asset._assetManager as Github)._filePath),
                'utf8'
              )
              .then(initialContent => {
                expect(initialContent).to.equal(updatedContent);
              });
          });
        });
    });
  });
  it('bumpToLatestVersion should throw a Error when incorrect asset', () => {
    setChaiAsPromised();
    const asset: Asset = deserializeObject(
      fs.readFileSync(ASSET_SAMPLE_INCORRECT_ASSET_MANAGER, 'utf8'),
      Asset
    );
    return expect(asset.bumpToLatestVersion()).to.eventually.be.rejectedWith(
      Error,
      '404'
    );
  });
  it(`bumpToLatestVersion should return asset with isUpdated true and update asset when latest asset in ${FORCE_OPTION} mode`, () => {
    setChaiAsPromised();
    const tempInput: any = JSON.parse(
      fs.readFileSync(ASSET_SAMPLE_VALID_LATEST, 'utf8')
    );
    tempInput.currentVersion = version;
    const asset: Asset = deserializeObject(JSON.stringify(tempInput), Asset);
    return asset
      .bumpToLatestVersion(true)
      .then(tempAsset => {
        expect(tempAsset._isUpdated).to.be.true;
      })
      .then(() => {
        return fs.readFile(asset._localPath, 'utf8').then(updatedContent => {
          return fs
            .readFile(
              path.join(rootPath, (asset._assetManager as Github)._filePath),
              'utf8'
            )
            .then(initialContent => {
              expect(initialContent).to.equal(updatedContent);
            });
        });
      });
  });
});
