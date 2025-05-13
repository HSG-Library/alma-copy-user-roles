export class ValidationInfo {
  public isValid: boolean = false;
  public msg: string = '';
  public err: object = {};

  public get valid(): boolean {
    return this.isValid;
  }
  public set valid(valid: boolean) {
    this.isValid = valid;
  }

  public get message(): string {
    return this.msg;
  }
  public set message(message: string) {
    this.msg = message;
  }

  public get rawError(): object {
    return this.err;
  }
  public set rawError(rawError: object) {
    this.err = rawError;
  }
}
