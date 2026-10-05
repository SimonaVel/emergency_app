export class RecordNotFoundException extends Error {
  static readonly defaultStatusCode = 404;
  static readonly defaultMessage = "Record not found";

  constructor() {
    super(RecordNotFoundException.defaultMessage);
    this.name = "RecordNotFoundException";
  }
}
