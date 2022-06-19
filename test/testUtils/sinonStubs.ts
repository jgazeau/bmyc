/* c8 ignore start */
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import {logger} from '../../src/utils/logger';

export class SinonStubs {
  private _logger: boolean;
  public get logger(): boolean {
    return this._logger;
  }
  public set logger(value: boolean) {
    this._logger = value;
  }
  private _consoleLog: boolean;
  public get consoleLog(): boolean {
    return this._consoleLog;
  }
  public set consoleLog(value: boolean) {
    this._consoleLog = value;
  }
  private _consoleError: boolean;
  public get consoleError(): boolean {
    return this._consoleError;
  }
  public set consoleError(value: boolean) {
    this._consoleError = value;
  }
  private _processExit: boolean;
  public get processExit(): boolean {
    return this._processExit;
  }
  public set processExit(value: boolean) {
    this._processExit = value;
  }

  constructor({
    logger = false,
    consoleLog = false,
    consoleError = false,
    processExit = false,
  }: sinonStubsParameters) {
    this.logger = logger;
    this.consoleLog = consoleLog;
    this.consoleError = consoleError;
    this.processExit = processExit;
  }

  sinonSetStubs() {
    chai.use(sinonChai);
    if (this.logger) sinon.stub(logger());
    if (this.consoleLog) sinon.stub(console, 'log');
    if (this.consoleError) sinon.stub(console, 'error');
    if (this.processExit) sinon.stub(process, 'exit');
  }

  sinonRestoreStubs() {
    sinon.restore();
  }
}

interface sinonStubsParameters {
  logger?: boolean;
  consoleLog?: boolean;
  consoleError?: boolean;
  processExit?: boolean;
}
/* c8 ignore stop */
