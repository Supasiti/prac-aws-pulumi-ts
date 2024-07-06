// import * as apigateway from '@pulumi/aws-apigateway';

import { createTable } from './dynamodb';
import { createIAMPolicy } from './iam';

const project = 'papt';
const service = 'user';
const rootId = `${project}-${service}-thara`;
const tableName = `${rootId}-user`;

const table = createTable({ tableName });

createIAMPolicy({
  actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
  policyName: `${rootId}-dynamodb-policy`,
  resourceArn: table.arn,
});

// create lambda

// create api gateway

// const api = new apigateway.RestAPI('api', {
//   routes: [{ path: '/date', method: 'GET', eventHandler: fn }],
// });

// The URL at which the REST API will be served.
// export const url = api.url;
