import {
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { log } from '../common/logger';
import { getDocumentClient } from './docClient';
import {
  TABLE_NAME,
  USER_SCHEMA,
  stripPrivateFields,
  toGetUserKey,
} from './util';
import type { CreateUserParams, User } from '../models/types';
import type { DaoDeps } from './types';
import { GeneralError } from '../common/error';

export async function getUser(
  userID: number,
  _deps?: DaoDeps,
): Promise<User | undefined> {
  log.info({ userID }, 'getUser: params');

  // istanbul ignore next
  const { dbClient = getDocumentClient() } = _deps || {};

  const params = {
    Key: toGetUserKey(userID),
    TableName: TABLE_NAME,
  };

  const response: GetCommandOutput = await dbClient.send(
    new GetCommand(params),
  );
  log.info(response, 'getUser: response from db');

  const { Item } = response;
  if (!Item) return Item;

  return stripPrivateFields<User>(Item);
}

export async function createUser(params: CreateUserParams, _deps?: DaoDeps) {
  log.info(params, 'createUser: params');

  // istanbul ignore next
  const { dbClient = getDocumentClient(), tableName = TABLE_NAME } =
    _deps || {};

  const userID = params.userID ?? Date.now();
  const lastUpdated = new Date().toISOString();
  const putCmd = new PutCommand({
    TableName: tableName,
    Item: {
      ...toGetUserKey(userID),
      $schema: USER_SCHEMA,
      $lastUpdated: lastUpdated,
      $created: lastUpdated,
      ...params,
      userID,
    },
  });

  const response: PutCommandOutput = await dbClient.send(putCmd);
  log.info(response, 'createUser: response from db');

  if (response['$metadata'].httpStatusCode !== 200) {
    throw GeneralError();
  }

  return { ...params, userID };
}
