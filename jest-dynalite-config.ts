const { unmarshall } = require('@aws-sdk/util-dynamodb');
const sampleData = require('./dynamodb/users_data.json');

const data = sampleData.Users.map((item) => unmarshall(item.PutRequest.Item));

module.exports = {
  tables: [
    {
      TableName: 'Users',
      KeySchema: [
        { AttributeName: '$pk', KeyType: 'HASH' },
        { AttributeName: '$sk', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: '$pk', AttributeType: 'S' },
        { AttributeName: '$sk', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
      data,
    },
  ],
  basePort: 3333,
};
