// import * as apigateway from '@pulumi/aws-apigateway';
import * as aws from '@pulumi/aws';

import { createTable } from './dynamodb';
import { createIAMPolicy } from './iam';

const project = 'papt';
const service = 'user';
const rootId = `${project}-${service}-thara`;
// const tableName = `${rootId}-user`;

const caller = aws.getCallerIdentity({});
const accountId = caller.then((c) => c.accountId);

console.log(accountId);
// const table = createTable({ tableName });

// createIAMPolicy({
//   actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
//   policyName: `${rootId}-dynamodb-policy`,
//   resourceArns: ],
// });

// const api = new apigateway.RestAPI('api', {
//   routes: [{ path: '/date', method: 'GET', eventHandler: fn }],
// });

// The URL at which the REST API will be served.
// export const url = api.url;
