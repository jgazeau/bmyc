import {expect} from 'chai';
import {PathLike} from 'fs-extra';
import {red} from 'kleur';
import {ConfigurationError} from '../../src/model/configurationError';
import {MAX_TTY_LENGTH} from '../../src/utils/const';
import {
  checkFilePath,
  getOutputWidth,
  headerFactory,
} from '../../src/utils/helpers';
import {logger} from '../../src/utils/logger';
import {NON_EXISTING_FILE} from '../testUtils/const';
import {SinonStubs} from '../testUtils/sinonStubs';

describe('Utils tests', () => {
  const sinonMock = new SinonStubs({});
  afterEach(() => {
    sinonMock.sinonRestoreStubs();
  });
  it('checkFilePath should return path when existing file path', () => {
    const filePath: PathLike = __filename;
    const configPath: PathLike = checkFilePath(filePath);
    expect(configPath).to.be.equal(filePath);
  });
  it('checkFilePath should throw a ConfigurationError when non existing file path', () => {
    const filePath: PathLike = NON_EXISTING_FILE;
    expect(() => {
      checkFilePath(filePath);
    }).to.throw(ConfigurationError);
  });
  it('getOutputWidth should return MAX_TTY_WIDTH at most', () => {
    process.stdout.columns = 0;
    expect(getOutputWidth()).to.equal(MAX_TTY_LENGTH);
  });
  it('getOutputWidth should return stdout length if less than MAX_TTY_WIDTH', () => {
    process.stdout.columns = 50;
    expect(getOutputWidth()).to.equal(process.stdout.columns);
  });
  it('headerFactory should log', () => {
    sinonMock.logger = true;
    sinonMock.sinonSetStubs();
    headerFactory(red);
    expect(logger().info).to.be.calledOnce;
  });
});
