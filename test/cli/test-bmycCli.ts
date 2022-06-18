import 'reflect-metadata';
import {expect} from 'chai';
import {BmycCli} from '../../src/cli/bmycCli';
import {SinonStubs} from '../testUtils/sinonStubs';
import {NON_EXISTING_FILE} from '../testUtils/const';
import {mockArgs, setChaiAsPromised} from '../testUtils/helpers';
import {DEFAULT_CONFIGURATION_FILE_NAME} from '../../src/utils/const';

describe('Bmyc CLI tests', () => {
  const sinonMock = new SinonStubs({});
  afterEach(() => {
    sinonMock.sinonRestoreStubs();
  });
  it('parse should display help and exit when help option', () => {
    setChaiAsPromised();
    sinonMock.consoleLog = true;
    sinonMock.processExit = true;
    sinonMock.sinonSetStubs();
    mockArgs(['--help']);
    const cli = new BmycCli();
    return cli.parse().then(() => {
      expect(console.log).to.be.calledOnce;
      expect(process.exit).to.be.calledOnce;
    });
  });
  it('parse should display version and exit when version option', () => {
    setChaiAsPromised();
    sinonMock.consoleLog = true;
    sinonMock.processExit = true;
    sinonMock.sinonSetStubs();
    mockArgs(['--version']);
    const cli = new BmycCli();
    return cli.parse().then(() => {
      expect(console.log).to.be.calledOnce;
      expect(process.exit).to.be.calledOnce;
    });
  });
  it('parse should set logger in debug mode when debug option', () => {
    setChaiAsPromised();
    mockArgs(['--debug']);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.debug).to.be.true;
    });
  });
  it('parse should have default arguments', () => {
    setChaiAsPromised();
    mockArgs([]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(DEFAULT_CONFIGURATION_FILE_NAME);
      expect(argv.force).to.be.false;
    });
  });
  it('parse should have specific configuration file argument and other default arguments when config option', () => {
    setChaiAsPromised();
    mockArgs(['--config', `${NON_EXISTING_FILE}`]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(NON_EXISTING_FILE);
      expect(argv.force).to.be.false;
    });
  });
  it('parse should have force argument and other default arguments when force option', () => {
    setChaiAsPromised();
    mockArgs(['--force']);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(DEFAULT_CONFIGURATION_FILE_NAME);
      expect(argv.force).to.be.true;
    });
  });
});
