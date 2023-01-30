/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {AssetManager} from './assetManager';

@ValidatorConstraint({name: 'AssetManagerValidator', async: false})
export class AssetManagerValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(assetManager: AssetManager, args: ValidationArguments) {
    if (
      assetManager &&
      assetManager instanceof AssetManager &&
      assetManager.constructor.name !== 'AssetManager'
    ) {
      return true;
    } else {
      return false;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return 'The Asset Manager defined does not exists';
  }
}
