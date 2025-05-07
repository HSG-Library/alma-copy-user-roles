export class ValidationInfo {
  isValid: boolean;
  msg: string;
  err: object;

  get valid(): boolean {
    return this.isValid;
  }
  set valid(valid: boolean) {
    this.isValid = valid;
  }

  get message(): string {
    return this.msg;
  }
  set message(message: string) {
    this.msg = message;
  }

  get rawError(): object {
    return this.err;
  }
  set rawError(rawError: object) {
    this.err = rawError;
  }
}
