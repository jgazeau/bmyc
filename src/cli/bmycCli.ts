import kleur = require('kleur');
import {hideBin} from 'yargs/helpers';
import {getOutputWidth} from '../utils/helpers';
import {IArgumentsParser, ICliArguments} from './iArgumentsParser';
import {BMYC_HEADER, DEFAULT_CONFIGURATION_FILE_NAME} from '../utils/const';
const yargs = require('yargs');

export class BmycCli {
  private GROUPS = {
    COMMONS: 'Common options:',
  };
  private static _debugMode = false;
  public static get debugMode(): boolean {
    return this._debugMode;
  }
  public static set debugMode(value: boolean) {
    this._debugMode = value;
  }

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
        BmycCli.debugMode = argv.debug;
        return true;
      })
      .updateStrings({
        'Options:': 'Other Options:',
        'Commands:': 'Commands:',
      })
      .usage(`${BMYC_HEADER}\nUsage: $0 [options]`)
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
      .wrap(getOutputWidth())
      .epilog(
        `Additional information:
  GitHub: ${kleur.green('https://github.com/jgazeau/bmyc.git')}
  Documentation: ${kleur.blue('https://github.com/jgazeau/bmyc#readme')}
  Issues: ${kleur.red('https://github.com/jgazeau/bmyc/issues')}
      `
      );
  }

  parse(): Promise<ICliArguments> {
    return Promise.resolve(this.parser.argv);
  }
}
