import {expect} from 'chai';
import {BmycCli} from '../../src/cli/bmycCli';
import {SinonStubs} from '../testUtils/sinonStubs';
import {NON_EXISTING_FILE} from '../testUtils/const';
import {mockArgs, setChaiAsPromised} from '../testUtils/helpers';
import {DEFAULT_CONFIGURATION_FILE_NAME} from '../../src/utils/const';

const sinonMock = new SinonStubs({});
describe('Bmyc CLI tests', () => {
  afterEach(() => {
    sinonMock.sinonRestoreStubs();
  });
  it('parse with help option should display help and exit', () => {
    sinonMock.consoleLog = true;
    sinonMock.processExit = true;
    sinonMock.sinonSetStubs();
    mockArgs(['--help']);
    const cli = new BmycCli();
    cli.parse();
    expect(console.log).to.be.calledOnce;
    expect(process.exit).to.be.calledOnce;
  });
  it('parse with version option should display version and exit', () => {
    sinonMock.consoleLog = true;
    sinonMock.processExit = true;
    sinonMock.sinonSetStubs();
    mockArgs(['--version']);
    const cli = new BmycCli();
    cli.parse();
    expect(console.log).to.be.calledOnce;
    expect(process.exit).to.be.calledOnce;
  });
  it('parse without option should have default arguments', () => {
    setChaiAsPromised();
    mockArgs([]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(DEFAULT_CONFIGURATION_FILE_NAME);
      expect(argv.force).to.be.false;
    });
  });
  it('parse with config option should have specific configuration file argument and other default arguments', () => {
    setChaiAsPromised();
    mockArgs(['--config', `"${NON_EXISTING_FILE}"`]);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(NON_EXISTING_FILE);
      expect(argv.force).to.be.false;
    });
  });
  it('parse with force option should have force argument and other default arguments', () => {
    setChaiAsPromised();
    mockArgs(['--force']);
    const cli = new BmycCli();
    return cli.parse().then(argv => {
      expect(argv.config).to.be.equal(DEFAULT_CONFIGURATION_FILE_NAME);
      expect(argv.force).to.be.true;
    });
  });
});