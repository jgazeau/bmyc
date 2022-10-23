import {expect} from 'chai';
import * as fs from 'fs-extra';
import {PathLike} from 'fs-extra';
import * as path from 'path';
import 'reflect-metadata';
import {Bmyc} from '../src/bmyc';
import {ConfigurationError} from '../src/model/configurationError';
import {Asset} from '../src/model/configurationFile/asset';
import {Configuration} from '../src/model/configurationFile/configuration';
import {
  CONFIG_OPTION,
  DEFAULT_CONFIGURATION_FILE_NAME,
  FORCE_OPTION,
} from '../src/utils/const';
import {rootPath, testResourcesPath, testTempPath} from './testUtils/const';
import {
  cleanTestTempDirectory,
  cleanupPrintResults,
  mockArgs,
  setChaiAsPromised,
} from './testUtils/helpers';
import {SinonStubs} from './testUtils/sinonStubs';

const DEFAULT_CONFIG_FILE: PathLike = path.join(
  testResourcesPath,
  DEFAULT_CONFIGURATION_FILE_NAME
);
const COPY_DEFAULT_CONFIG_FILE: PathLike = path.join(
  testTempPath,
  DEFAULT_CONFIGURATION_FILE_NAME
);
const SPECIFIC_CONFIG_FILE_NAME: PathLike = '.bmycconfig-specific.json';
const SPECIFIC_CONFIG_FILE: PathLike = path.join(
  testResourcesPath,
  SPECIFIC_CONFIG_FILE_NAME
);
const COPY_SPECIFIC_CONFIG_FILE: PathLike = path.join(
  testTempPath,
  SPECIFIC_CONFIG_FILE_NAME
);
const INCORRECT_CONFIG_FILE_NAME: PathLike = '.bmycconfig-incorrect.json';
const INCORRECT_CONFIG_FILE: PathLike = path.join(
  testResourcesPath,
  INCORRECT_CONFIG_FILE_NAME
);
const COPY_INCORRECT_CONFIG_FILE: PathLike = path.join(
  testTempPath,
  INCORRECT_CONFIG_FILE_NAME
);

describe('Bmyc tests', () => {
  const sinonMock = new SinonStubs({});
  beforeEach(() => {
    cleanupPrintResults();
    cleanTestTempDirectory();
    process.chdir(rootPath);
    sinonMock.logger = true;
    sinonMock.consoleLog = true;
    sinonMock.sinonSetStubs();
  });
  afterEach(() => {
    sinonMock.sinonRestoreStubs();
  });
  it('Bmyc should throw a ConfigurationError when no default configuration file', () => {
    setChaiAsPromised();
    mockArgs([]);
    return expect(Bmyc.main()).to.eventually.be.rejectedWith(
      ConfigurationError
    );
  });
  it('Bmyc should create assets and update configuration file when default configuration file', () => {
    setChaiAsPromised();
    mockArgs([]);
    return fs
      .copyFile(DEFAULT_CONFIG_FILE, COPY_DEFAULT_CONFIG_FILE)
      .then(() => {
        process.chdir(testTempPath);
        return Bmyc.main().then((updatedConfig: Configuration) => {
          return Promise.all(
            updatedConfig._assets.map((asset: Asset) => {
              return fs
                .pathExists(asset._localPath.toString())
                .then(isFileExists => {
                  expect(isFileExists).to.be.true;
                  expect(asset._isUpdated).to.be.true;
                  expect(asset._currentVersion).to.exist.and.to.not.be.empty;
                });
            })
          ).then(() => {
            return fs
              .readFile(COPY_DEFAULT_CONFIG_FILE, 'utf8')
              .then(updatedConfigContent => {
                return fs
                  .readFile(DEFAULT_CONFIG_FILE)
                  .then(initialConfigContent => {
                    expect(initialConfigContent).to.not.equal(
                      updatedConfigContent
                    );
                  });
              });
          });
        });
      });
  });
  it('Bmyc should create assets and update configuration file when specific configuration file', () => {
    setChaiAsPromised();
    mockArgs([`--${CONFIG_OPTION}`, `${COPY_SPECIFIC_CONFIG_FILE}`]);
    return fs
      .copyFile(SPECIFIC_CONFIG_FILE, COPY_SPECIFIC_CONFIG_FILE)
      .then(() => {
        return Bmyc.main().then((updatedConfig: Configuration) => {
          return Promise.all(
            updatedConfig._assets.map((asset: Asset) => {
              return fs
                .pathExists(asset._localPath.toString())
                .then(isFileExists => {
                  expect(isFileExists).to.be.true;
                  expect(asset._isUpdated).to.be.true;
                  expect(asset._currentVersion).to.exist.and.to.not.be.empty;
                });
            })
          ).then(() => {
            return fs
              .readFile(COPY_SPECIFIC_CONFIG_FILE, 'utf8')
              .then(updatedConfigContent => {
                return fs
                  .readFile(SPECIFIC_CONFIG_FILE)
                  .then(initialConfigContent => {
                    expect(initialConfigContent).to.not.equal(
                      updatedConfigContent
                    );
                  });
              });
          });
        });
      });
  });
  it(`Bmyc should create assets and update configuration file when up-to-date default configuration file and ${FORCE_OPTION} option`, () => {
    setChaiAsPromised();
    mockArgs([`--${FORCE_OPTION}`]);
    return fs
      .copyFile(DEFAULT_CONFIG_FILE, COPY_DEFAULT_CONFIG_FILE)
      .then(() => {
        process.chdir(testTempPath);
        const configuration = new Configuration(COPY_DEFAULT_CONFIG_FILE);
        let initialConfigContent: string;
        return Promise.all(
          configuration._assets.map((asset: Asset) => {
            return asset.setToLatestVersion().then(() => {
              return fs.ensureFile(asset._localPath.toString()).then(() => {
                return fs
                  .readFile(asset._localPath, 'utf8')
                  .then(initialContent => {
                    expect(initialContent).to.be.empty;
                  });
              });
            });
          })
        )
          .then(() => {
            return configuration.save().then(() => {
              return fs
                .readFile(COPY_DEFAULT_CONFIG_FILE, 'utf8')
                .then(configContent => {
                  initialConfigContent = configContent;
                });
            });
          })
          .then(() => {
            return Bmyc.main().then((updatedConfig: Configuration) => {
              return Promise.all(
                updatedConfig._assets.map((asset: Asset) => {
                  return fs
                    .readFile(asset._localPath, 'utf8')
                    .then(updatedContent => {
                      expect(updatedContent).to.not.be.empty;
                      expect(asset._isUpdated).to.be.true;
                      expect(asset._currentVersion).to.exist.and.to.not.be
                        .empty;
                    });
                })
              ).then(() => {
                return fs
                  .readFile(COPY_DEFAULT_CONFIG_FILE, 'utf8')
                  .then(updatedConfigContent => {
                    expect(initialConfigContent).to.equal(updatedConfigContent);
                  });
              });
            });
          });
      });
  });
  it(`Bmyc should create assets and update configuration file when up-to-date specific configuration file and ${FORCE_OPTION} option`, () => {
    setChaiAsPromised();
    mockArgs([
      `--${CONFIG_OPTION}`,
      `${COPY_SPECIFIC_CONFIG_FILE}`,
      `--${FORCE_OPTION}`,
    ]);
    return fs
      .copyFile(SPECIFIC_CONFIG_FILE, COPY_SPECIFIC_CONFIG_FILE)
      .then(() => {
        const configuration = new Configuration(COPY_SPECIFIC_CONFIG_FILE);
        let initialConfigContent: string;
        return Promise.all(
          configuration._assets.map((asset: Asset) => {
            return asset.setToLatestVersion().then(() => {
              return fs.ensureFile(asset._localPath.toString()).then(() => {
                return fs
                  .readFile(asset._localPath, 'utf8')
                  .then(initialContent => {
                    expect(initialContent).to.be.empty;
                  });
              });
            });
          })
        )
          .then(() => {
            return configuration.save().then(() => {
              return fs
                .readFile(COPY_SPECIFIC_CONFIG_FILE, 'utf8')
                .then(configContent => {
                  initialConfigContent = configContent;
                });
            });
          })
          .then(() => {
            return Bmyc.main().then((updatedConfig: Configuration) => {
              return Promise.all(
                updatedConfig._assets.map((asset: Asset) => {
                  return fs
                    .readFile(asset._localPath, 'utf8')
                    .then(updatedContent => {
                      expect(updatedContent).to.not.be.empty;
                      expect(asset._isUpdated).to.be.true;
                      expect(asset._currentVersion).to.exist.and.to.not.be
                        .empty;
                    });
                })
              ).then(() => {
                return fs
                  .readFile(COPY_SPECIFIC_CONFIG_FILE, 'utf8')
                  .then(updatedConfigContent => {
                    expect(initialConfigContent).to.equal(updatedConfigContent);
                  });
              });
            });
          });
      });
  });
  it('Bmyc should do nothing when up-to-date default configuration file', () => {
    setChaiAsPromised();
    mockArgs([]);
    return fs
      .copyFile(DEFAULT_CONFIG_FILE, COPY_DEFAULT_CONFIG_FILE)
      .then(() => {
        process.chdir(testTempPath);
        const configuration = new Configuration(COPY_DEFAULT_CONFIG_FILE);
        let initialConfigContent: string;
        return Promise.all(
          configuration._assets.map((asset: Asset) => {
            return asset.setToLatestVersion().then(() => {
              return fs.ensureFile(asset._localPath.toString()).then(() => {
                return fs
                  .readFile(asset._localPath, 'utf8')
                  .then(initialContent => {
                    expect(initialContent).to.be.empty;
                  });
              });
            });
          })
        )
          .then(() => {
            return configuration.save().then(() => {
              return fs
                .readFile(COPY_DEFAULT_CONFIG_FILE, 'utf8')
                .then(configContent => {
                  initialConfigContent = configContent;
                });
            });
          })
          .then(() => {
            return Bmyc.main().then((updatedConfig: Configuration) => {
              return Promise.all(
                updatedConfig._assets.map((asset: Asset) => {
                  expect(asset._isUpdated).to.be.false;
                })
              ).then(() => {
                return fs
                  .readFile(COPY_DEFAULT_CONFIG_FILE, 'utf8')
                  .then(updatedConfigContent => {
                    expect(initialConfigContent).to.equal(updatedConfigContent);
                  });
              });
            });
          });
      });
  });
  it('Bmyc should create 1 asset and update configuration file when incorrect configuration file', () => {
    setChaiAsPromised();
    mockArgs([`--${CONFIG_OPTION}`, `${COPY_INCORRECT_CONFIG_FILE}`]);
    return fs
      .copyFile(INCORRECT_CONFIG_FILE, COPY_INCORRECT_CONFIG_FILE)
      .then(() => {
        return Bmyc.main().then((updatedConfig: Configuration) => {
          return Promise.all(
            updatedConfig._assets.map((asset: Asset, index: number) => {
              return fs
                .pathExists(asset._localPath.toString())
                .then(isFileExists => {
                  if (index === 0) {
                    expect(isFileExists).to.be.false;
                    expect(asset._isUpdated).to.be.false;
                    expect(asset._currentVersion).to.not.exist;
                  } else {
                    expect(isFileExists).to.be.true;
                    expect(asset._isUpdated).to.be.true;
                    expect(asset._currentVersion).to.exist.and.to.not.be.empty;
                  }
                });
            })
          ).then(() => {
            return fs
              .readFile(COPY_INCORRECT_CONFIG_FILE, 'utf8')
              .then(updatedConfigContent => {
                return fs
                  .readFile(INCORRECT_CONFIG_FILE)
                  .then(initialConfigContent => {
                    expect(initialConfigContent).to.not.equal(
                      updatedConfigContent
                    );
                  });
              });
          });
        });
      });
  });
});
