import * as aws from '@pulumi/aws';
import { CreateUserParams } from '../../src/models/types';
import { createUser } from '../../src/dao/userDao';

export type CreateTableParams = {
  tableName: string;
};

export function createTable(params: CreateTableParams) {
  const { tableName } = params;

  const table = new aws.dynamodb.Table(`${tableName}-table`, {
    name: tableName,
    billingMode: 'PAY_PER_REQUEST',
    attributes: [
      {
        name: '$pk',
        type: 'S',
      },
      {
        name: '$sk',
        type: 'S',
      },
    ],

    hashKey: '$pk',
    rangeKey: '$sk',
  });

  return table;
}

function upsertUsers(tableName: string, items: CreateUserParams[]) {
  return items.map(async (i) => {
    createUser(i, { tableName });
  });
}

export function seedUserTable(
  table: aws.dynamodb.Table,
  items: CreateUserParams[],
) {
  return table.name.apply((name) => upsertUsers(name, items));
}
