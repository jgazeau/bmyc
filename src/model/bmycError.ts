export class BmycError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BmycError';
  }
}
