import { HttpError } from './error';

export const HttpHeader = {
  CacheControl: 'Cache-Control',
  ContentType: 'Content-Type',
};

export const MIME_TYPE = {
  JSON: 'application/json',
};

const HEADERS = {
  [HttpHeader.CacheControl]: 'no-cache',
  [HttpHeader.ContentType]: MIME_TYPE.JSON,
};

type LambdaResponseParams = {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
};

export const lambdaResponse = (params: LambdaResponseParams) => {
  const { headers = {}, body, statusCode } = params;
  return {
    statusCode,
    headers: { ...HEADERS, ...headers },
    body,
  };
};

type SuccessParams = {
  statusCode?: number;
  data?: any;
  headers?: { [key: string]: string };
};

export const success = (params?: SuccessParams) => {
  const { statusCode = 200, data = {}, headers = {} } = params || {};

  return lambdaResponse({
    statusCode,
    body: JSON.stringify({ data }),
    headers,
  });
};

const toErrors = (err: string | Error) => {
  if (typeof err === 'string') {
    return [{ detail: err }];
  }
  return [{ detail: err.message, title: err.name }];
};

export const error = (err: string | Error, statusCode?: number) => {
  const errors = toErrors(err);
  let code = statusCode || 500;

  if (err instanceof HttpError) {
    // extract status code from HttpError
    code = err.status;
  }

  return lambdaResponse({ statusCode: code, body: JSON.stringify(errors) });
};
