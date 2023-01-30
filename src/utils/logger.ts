import {Logger} from 'tslog';
import {ILogObj} from 'tslog/dist/types/interfaces';
import {BmycCli} from '../cli/bmycCli';

export class LoggerFactory {
  private static _logger: Logger<ILogObj>;
  public static get logger(): Logger<ILogObj> {
    return LoggerFactory._logger;
  }
  public static set logger(value: Logger<ILogObj>) {
    LoggerFactory._logger = value;
  }

  public static getInstance(): Logger<ILogObj> {
    if (!this.logger) {
      const loggerLevel: number =
        BmycCli.cliArgs !== undefined ? (BmycCli.cliArgs.debug ? 2 : 3) : 3;
      this.logger = new Logger({
        type: 'pretty',
        minLevel: loggerLevel,
      });
    }
    return this.logger;
  }
}

export function logger(): Logger<ILogObj> {
  return LoggerFactory.getInstance();
}
