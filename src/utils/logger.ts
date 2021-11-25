import {BmycCli} from '../cli/bmycCli';
import {Logger, TLogLevelName} from 'tslog';

export class LoggerFactory {
  private static _logger: Logger;
  public static get logger(): Logger {
    return LoggerFactory._logger;
  }
  public static set logger(value: Logger) {
    LoggerFactory._logger = value;
  }

  public static getInstance(): Logger {
    if (!this.logger) {
      const loggerLevel: TLogLevelName =
        BmycCli.cliArgs !== undefined
          ? BmycCli.cliArgs.debug
            ? 'debug'
            : 'info'
          : 'info';
      this.logger = new Logger({
        type: 'pretty',
        minLevel: loggerLevel,
        displayFunctionName: false,
      });
    }
    return this.logger;
  }
}

export function logger(): Logger {
  return LoggerFactory.getInstance();
}
