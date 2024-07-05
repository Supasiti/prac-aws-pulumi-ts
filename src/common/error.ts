type HttpErrorParams = {
  message: string;
  name?: string;
  status: number;
};

export class HttpError extends Error {
  status: number;

  constructor(obj: HttpErrorParams) {
    super(obj.message);

    // When changing from jest-babel to ts-jest, instanceof stopped working.
    // Found this solution here: https://github.com/microsoft/TypeScript/issues/22585
    Object.setPrototypeOf(this, HttpError.prototype);

    this.status = obj.status;
    this.name = obj.name ?? 'HttpError';
  }
}
export function UnauthorizedError(msg?: string) {
  return new HttpError({ message: msg || 'Unauthorized', status: 401 });
}

export function DataNotFoundError(msg?: string) {
  return new HttpError({ message: msg || 'Data Not Found', status: 404 });
}

export function GeneralError(msg?: string) {
  return new HttpError({
    message: msg || 'Internal Server Error',
    status: 500,
  });
}

export function ValidationError(msg?: string) {
  return new HttpError({ message: msg || 'Validation Error', status: 403 });
}
