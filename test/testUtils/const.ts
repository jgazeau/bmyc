/* c8 ignore start */
import * as path from 'path';
import {TLogLevelName} from 'tslog';

export const logTestLevel: TLogLevelName = 'debug';
export const rootPath: string = path.join(process.cwd());
export const testResourcesPath: string = path.join(rootPath, '/test/resources');
export const testTempPath: string = path.join(rootPath, '/test/temp');
export const NON_EXISTING_FILE = 'non-existing-file.json';
export const TEST_SUMMARY_PR_FILE_NAME = 'test-summary-pr.md';
export const TEST_SUMMARY_PR_FILE_PATH = './test/temp/test-summary-pr.md';
/* c8 ignore stop */
