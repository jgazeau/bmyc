import {expect} from 'chai';
import 'reflect-metadata';
import {BmycCli} from '../../src/cli/bmycCli';
import {
  CONFIG_OPTION,
  DEFAULT_CONFIGURATION_FILE_NAME,
  FORCE_OPTION,
  SUMMARY_PR_OPTION,
} from '../../src/utils/const';
import {NON_EXISTING_FILE, TEST_SUMMARY_PR_FILE_NAME} from '../testUtils/const';
import {mockArgs, setChaiAsPromised} from '../testUtils/helpers';
import {SinonStubs} from '../testUtils/sinonStubs';

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
  it('parse should parse arguments', () => {
    setChaiAsPromised();
    mockArgs([]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(DEFAULT_CONFIGURATION_FILE_NAME);
      expect(argv.summaryPR).to.be.undefined;
      expect(argv.force).to.be.false;
    });
  });
  it(`parse should parse arguments when ${CONFIG_OPTION} option`, () => {
    setChaiAsPromised();
    mockArgs([`--${CONFIG_OPTION}`, `${NON_EXISTING_FILE}`]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(NON_EXISTING_FILE);
      expect(argv.force).to.be.false;
    });
  });
  it('parse should display error and exit when config file is not set', () => {
    setChaiAsPromised();
    sinonMock.consoleError = true;
    sinonMock.processExit = true;
    sinonMock.sinonSetStubs();
    mockArgs([`--${CONFIG_OPTION}`]);
    const cli = new BmycCli();
    return cli.parse().then(() => {
      expect(console.error).to.be.called;
      expect(process.exit).to.be.called;
    });
  });
  it(`parse should parse arguments when ${FORCE_OPTION} option`, () => {
    setChaiAsPromised();
    mockArgs([`--${FORCE_OPTION}`]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(DEFAULT_CONFIGURATION_FILE_NAME);
      expect(argv.force).to.be.true;
    });
  });
  it('parse should display error and exit when summary PR file is not set', () => {
    setChaiAsPromised();
    sinonMock.consoleError = true;
    sinonMock.processExit = true;
    sinonMock.sinonSetStubs();
    mockArgs([`--${SUMMARY_PR_OPTION}`]);
    const cli = new BmycCli();
    return cli.parse().then(() => {
      expect(console.error).to.be.called;
      expect(process.exit).to.be.called;
    });
  });
  it(`parse should parse arguments when specific ${SUMMARY_PR_OPTION} option`, () => {
    setChaiAsPromised();
    mockArgs([`--${SUMMARY_PR_OPTION}`, `${TEST_SUMMARY_PR_FILE_NAME}`]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.summaryPR).to.be.equal(TEST_SUMMARY_PR_FILE_NAME);
    });
  });
});
