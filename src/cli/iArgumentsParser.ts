import {PathLike} from 'fs-extra';
import {Arguments, Argv} from 'yargs';

export interface IArgumentsParser extends Argv {
  argv: ICliArguments;
}

export interface ICliArguments extends Arguments {
  debug: boolean;
  force: boolean;
  config: PathLike;
}
