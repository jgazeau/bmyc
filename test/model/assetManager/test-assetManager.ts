import 'reflect-metadata';
import {AssetManager} from '../../../src/model/assetManagers/assetManager';
import {ConfigurationError} from '../../../src/model/configurationError';

describe('AssetManager tests', () => {
  it('getLatestVersion should throw a ConfigurationError', async () => {
    class testAssetManager extends AssetManager {}
    const assetmanager: testAssetManager = new testAssetManager();
    const {expect} = await import('chai');
    expect(assetmanager.getLatestVersion).to.throw(ConfigurationError);
  });
  it('getContent should throw a ConfigurationError', async () => {
    class testAssetManager extends AssetManager {}
    const assetmanager: testAssetManager = new testAssetManager();
    const {expect} = await import('chai');
    expect(assetmanager.getContent).to.throw(ConfigurationError);
  });
});
