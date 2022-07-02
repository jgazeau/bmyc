export class BmycError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BmycError';
  }
}

export function unknownLatestVersionError(file: string): BmycError {
  return new BmycError(`Cannot retrieve latest version for ${file}`);
}
