import { WixBusinessError, HttpStatus } from '@wix/wix-errors';

export class InternalServerError extends WixBusinessError {
  // default error code: -100, default http status: 500.
  // See https://github.com/wix-platform/wix-node-platform/blob/master/errors/wix-errors/README.md
  constructor(msg?: string, cause?: Error | string) {
    super(msg, {
      cause,
      errorCode: 1011,
      httpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
