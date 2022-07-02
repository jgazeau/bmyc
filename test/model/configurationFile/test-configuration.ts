import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {setChaiAsPromised} from '../../testUtils/helpers';
import {Asset} from '../../../src/model/configurationFile/asset';
import {ConfigurationError} from '../../../src/model/configurationError';
import {Configuration} from '../../../src/model/configurationFile/configuration';
import {
  NON_EXISTING_FILE,
  testTempPath,
  testResourcesPath,
} from '../../testUtils/const';
import {AssetManagerType} from '../../../src/model/assetManagers/assetManagerType';

const CONFIG_OK: PathLike = path.join(testResourcesPath, 'config-ok.json');
const CONFIG_OK_DUPLICATE: PathLike = path.join(
  testResourcesPath,
  'config-ok-duplicate.json'
);
const CONFIG_KO_CONTENT: PathLike = path.join(
  testResourcesPath,
  'config-ko-content.json'
);
const CONFIG_KO_DUPLICATE: PathLike = path.join(
  testResourcesPath,
  'config-ko-duplicate.json'
);
const CONFIG_KO_INCOMPLETE: PathLike = path.join(
  testResourcesPath,
  'config-ko-incomplete.json'
);
const CONFIG_KO_JSON: PathLike = path.join(
  testResourcesPath,
  'config-ko-json.json'
);

describe('Configuration tests', () => {
  it('Configuration should parse a correct JSON when valid configuration file', () => {
    const configFile: Configuration = new Configuration(CONFIG_OK);
    expect(configFile._filePath).to.be.a('string');
    expect(configFile._assets.length).to.be.equal(
      Object.keys(AssetManagerType).length
    );
    expect(configFile._assets).to.be.an.instanceof(Array);
    configFile._assets.forEach(asset => {
      expect(asset).to.be.an.instanceof(Asset);
    });
  });
  it('Configuration should parse a correct JSON when valid configuration file with same assets name', () => {
    const configFile: Configuration = new Configuration(CONFIG_OK_DUPLICATE);
    expect(configFile._filePath).to.be.a('string');
    expect(configFile._assets.length).to.be.equal(2);
    expect(configFile._assets).to.be.an.instanceof(Array);
    configFile._assets.forEach(asset => {
      expect(asset).to.be.an.instanceof(Asset);
    });
  });
  it('Configuration should throw a SyntaxError when invalid configuration file', () => {
    expect(() => {
      new Configuration(CONFIG_KO_JSON);
    }).to.throw(SyntaxError);
  });
  it('Configuration should throw a ConfigurationError when bad content configuration file path', () => {
    expect(() => {
      new Configuration(CONFIG_KO_CONTENT);
    }).to.throw(ConfigurationError);
  });
  it('Configuration should throw a ConfigurationError when configuration file with same package name', () => {
    expect(() => {
      new Configuration(CONFIG_KO_DUPLICATE);
    }).to.throw(ConfigurationError);
  });
  it('Configuration should throw a ConfigurationError when incomplete configuration file', () => {
    expect(() => {
      new Configuration(CONFIG_KO_INCOMPLETE);
    }).to.throw(ConfigurationError);
  });
  it('Configuration should throw a ConfigurationError when non existing configuration file path', () => {
    expect(() => {
      new Configuration(NON_EXISTING_FILE);
    }).to.throw(ConfigurationError);
  });
  it('save should save configuration', () => {
    setChaiAsPromised();
    const savedConfigurationPath: PathLike = path.join(
      testTempPath,
      'savedConfiguration.json'
    );
    const configuration = new Configuration(CONFIG_OK);
    configuration._filePath = savedConfigurationPath;
    return fs.rm(savedConfigurationPath, {force: true}).then(() => {
      return configuration.save().then(() => {
        return fs
          .pathExists(savedConfigurationPath)
          .then(exists => {
            expect(exists).to.equal(true);
          })
          .then(() => {
            return fs
              .readFile(savedConfigurationPath, 'utf8')
              .then(savedContent => {
                return fs.readFile(CONFIG_OK, 'utf8').then(originContent => {
                  expect(originContent).to.equal(savedContent);
                });
              });
          });
      });
    });
  });
});
