import * as aws from '@pulumi/aws';

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
