/* c8 ignore start */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs-extra';
import {PrintResults} from '../../src/utils/stats';
import {testTempPath} from './const';

export function setChaiAsPromised(): void {
  chai.should();
  chai.use(chaiAsPromised);
}

export function mockArgs(args: string[]): void {
  const tempArgv: string[] = process.argv;
  process.argv = [...tempArgv.slice(0, 2), ...args];
}

export function cleanTestTempDirectory(): void {
  fs.emptyDirSync(testTempPath);
}

export function cleanupPrintResults(): void {
  PrintResults.results = [];
  PrintResults.table = [];
  PrintResults.totalCount.heldOutdated = 0;
  PrintResults.totalCount.heldUptodate = 0;
  PrintResults.totalCount.error = 0;
  PrintResults.totalCount.uptodate = 0;
  PrintResults.totalCount.updated = 0;
}
/* c8 ignore stop */
