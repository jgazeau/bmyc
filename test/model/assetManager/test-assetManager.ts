import 'reflect-metadata';
import {expect} from 'chai';
import {ConfigurationError} from '../../../src/model/configurationError';
import {AssetManager} from '../../../src/model/assetManagers/assetManager';

describe('AssetManager tests', () => {
  it('getLatestVersion should throw a ConfigurationError', () => {
    class testAssetManager extends AssetManager {}
    const assetmanager: testAssetManager = new testAssetManager();
    expect(assetmanager.getLatestVersion).to.throw(ConfigurationError);
  });
  it('getContent should throw a ConfigurationError', () => {
    class testAssetManager extends AssetManager {}
    const assetmanager: testAssetManager = new testAssetManager();
    expect(assetmanager.getContent).to.throw(ConfigurationError);
  });
});
