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
  afterEach(async () => {
    await sinonMock.sinonRestoreStubs();
  });
  it('checkFilePath should return path when existing file path', async () => {
    const filePath: PathLike = __filename;
    const configPath: PathLike = checkFilePath(filePath);
    const {expect} = await import('chai');
    expect(configPath).to.be.equal(filePath);
  });
  it('checkFilePath should throw a ConfigurationError when non existing file path', async () => {
    const filePath: PathLike = NON_EXISTING_FILE;
    const {expect} = await import('chai');
    expect(() => {
      checkFilePath(filePath);
    }).to.throw(ConfigurationError);
  });
  it('getOutputWidth should return MAX_TTY_WIDTH at most', async () => {
    process.stdout.columns = 0;
    const {expect} = await import('chai');
    expect(getOutputWidth()).to.equal(MAX_TTY_LENGTH);
  });
  it('getOutputWidth should return stdout length if less than MAX_TTY_WIDTH', async () => {
    process.stdout.columns = 50;
    const {expect} = await import('chai');
    expect(getOutputWidth()).to.equal(process.stdout.columns);
  });
  it('headerFactory should log', async () => {
    sinonMock.logger = true;
    await sinonMock.sinonSetStubs();
    headerFactory(red);
    const {expect} = await import('chai');
    expect(logger().info).to.be.calledOnce;
  });
});
