import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CreateUserParams, User } from '../models/types';

export type DbBase = {
  $pk: string;
  $sk: string;
  $schema: string;
  $lastUpdated: string;
  $created: string;
};

export type DbUser = DbBase & User;

export type DaoDeps = {
  dbClient?: DynamoDBDocumentClient;
  tableName?: string;
};

export type UserDao = {
  getUser: (userID: number, _deps?: DaoDeps) => Promise<User | undefined>;
  createUser: (params: CreateUserParams, _deps?: DaoDeps) => Promise<User>;
};
