import kleur = require('kleur');
import {hideBin} from 'yargs/helpers';
import {IArgumentsParser, ICliArguments} from './iArgumentsParser';
import {CLI_USAGE, DEFAULT_CONFIGURATION_FILE_NAME} from '../utils/const';
const yargs = require('yargs');

export class BmycCli {
  private GROUPS = {
    COMMONS: 'Common options:',
  };
  private static _cliArgs: ICliArguments;
  /* c8 ignore start */
  public static get cliArgs() {
    return BmycCli._cliArgs;
  }
  public static set cliArgs(value) {
    BmycCli._cliArgs = value;
  }
  /* c8 ignore stop */

  private parser: IArgumentsParser;
  /* c8 ignore start */
  public get _parser(): IArgumentsParser {
    return this.parser;
  }
  public set _parser(value: IArgumentsParser) {
    this.parser = value;
  }
  /* c8 ignore stop */

  constructor() {
    this._parser = yargs(hideBin(process.argv))
      .scriptName('bmyc')
      .check((argv: ICliArguments) => {
        BmycCli.cliArgs = argv;
        return true;
      })
      .updateStrings({
        'Options:': 'Other Options:',
        'Commands:': 'Commands:',
      })
      .usage(CLI_USAGE)
      .alias('v', 'version')
      .alias('h', 'help')
      .example([
        ['$0 --force', "Force asset's update"],
        ['$0 --config "./myconfig.json"', 'Use specific configuration file'],
      ])
      .options({
        debug: {
          type: 'boolean',
          default: false,
          description: 'Turn on debug logging',
        },
        force: {
          alias: 'f',
          type: 'boolean',
          default: false,
          description: 'Force update of configuration',
          group: this.GROUPS.COMMONS,
        },
        config: {
          alias: 'c',
          type: 'PathLike',
          default: DEFAULT_CONFIGURATION_FILE_NAME,
          description: 'Path of the configuration file',
          group: this.GROUPS.COMMONS,
        },
      })
      .wrap(null)
      .epilog(
        `Additional information:
  GitHub: ${kleur.green('https://github.com/jgazeau/bmyc.git')}
  Documentation: ${kleur.blue('https://github.com/jgazeau/bmyc#readme')}
  Issues: ${kleur.red('https://github.com/jgazeau/bmyc/issues')}
      `
      );
  }

  parse(): Promise<ICliArguments> {
    this.parser.argv;
    return Promise.resolve(BmycCli.cliArgs);
  }
}
