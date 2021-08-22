/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as fs from 'fs-extra';
import {logger} from './logger';
import {PathLike} from 'fs-extra';
import {Color, white} from 'kleur';
import {TLogLevelName} from 'tslog';
import {BMYC_HEADER, MAX_TTY_LENGTH} from './const';
import {ClassConstructor, deserialize} from 'class-transformer';
import {validateSync, ValidationError} from 'class-validator';
import {ConfigurationError} from '../model/configurationError';

export function checkFilePath(filePath: PathLike): PathLike {
  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    throw new ConfigurationError(`File not found (${filePath})`);
  }
}

export function validateClassObjectSync(
  object: Object,
  objectType?: string,
  parentObjectType?: string
): void {
  const objectTypeMessage = objectType ? objectType : typeof objectType;
  const parentObjectTypeMessage = parentObjectType
    ? `of ${parentObjectType}`
    : '';
  const validationErrors: ValidationError[] = validateSync(object);
  if (validationErrors.length > 0) {
    throw new ConfigurationError(
      `Validation failed on ${objectTypeMessage} ${parentObjectTypeMessage} with following(s) error(s): \n ${validationErrors}`
    );
  }
}

export function deserializeObject(
  object: any,
  type: ClassConstructor<any>
): any {
  const deserializedObject: any = deserialize(type, object);
  validateClassObjectSync(deserializedObject);
  return deserializedObject;
}

export function headerFactory(
  color: Color = white,
  logLevel: TLogLevelName = 'info'
): void {
  logger()[logLevel](color(`${BMYC_HEADER}`));
}

export function getOutputWidth(): number {
  return process.stdout.columns
    ? Math.min(process.stdout.columns, MAX_TTY_LENGTH)
    : MAX_TTY_LENGTH;
}
