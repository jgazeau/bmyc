#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any*/
import 'reflect-metadata';
import {red} from 'kleur';
import {logger} from './utils/logger';
import {BmycCli} from './cli/bmycCli';
import {PrintResults} from './utils/stats';
import {headerFactory} from './utils/helpers';
import {Asset} from './model/configurationFile/asset';
import {Configuration} from './model/configurationFile/configuration';

export class Bmyc {
  static main(): Promise<Configuration> {
    return new BmycCli()
      .parse()
      .then(cliArgs => {
        headerFactory();
        const configuration = new Configuration(cliArgs.config);
        logger().info(`${configuration._assets.length} asset(s) to process`);
        return Promise.all(
          configuration._assets.map((asset: Asset) => {
            return asset
              .bumpToLatestVersion(cliArgs.force)
              .then(tempAsset => {
                PrintResults.storeResult(tempAsset);
              })
              .catch((error: Error) => {
                PrintResults.storeResult(asset, error);
                logger().debug(error);
              });
          })
        )
          .then(() => {
            PrintResults.printResults();
          })
          .then(() => {
            return Promise.resolve(configuration);
          });
      })
      .then((configuration: Configuration) => {
        return configuration.save();
      });
  }
}

Bmyc.main().catch((error: Error) => {
  logger().error(red(`${error.message}`));
  logger().debug(error);
  process.exitCode = 1;
});
