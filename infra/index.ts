// import * as apigatewday from '@pulumi/aws-apigateway';
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

import { createTable } from './dynamodb';
import { createIAMPolicy } from './iam';
import { createNodeLambda } from './lambda';
import { routeApi } from './apigwIntegration';

const awsConfig = new pulumi.Config('aws');
const awsRegion = awsConfig.require('region');

const project = 'papt';
const service = 'user';
const rootId = `${project}-${service}-thara`;
const userTableName = `${rootId}-user`;

const table = createTable({ tableName: userTableName });

const tablePolicy = createIAMPolicy({
  actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
  policyName: `${rootId}-dynamodb-policy`,
  resourceArn: table.arn,
});

// create lambda
const getUserLambda = createNodeLambda(rootId, 'getUser', {
  description: 'get user details by id',
  environment: {
    variables: {
      USER_TABLE_NAME: userTableName,
      REGION: awsRegion,
    },
  },
  policies: [tablePolicy],
});

// create api gateway
const apigw = new aws.apigatewayv2.Api(`${rootId}-api`, {
  protocolType: 'HTTP',
});

routeApi(rootId, {
  name: 'getUser',
  apigw,
  lambda: getUserLambda,
  method: 'GET',
  key: '/users/{userID}',
});

// The URL at which the REST API will be served.
export const url = apigw.apiEndpoint;
