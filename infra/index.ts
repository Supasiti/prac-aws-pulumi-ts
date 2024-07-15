import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

import { createTable } from './dynamodb';
import { createIAMPolicy } from './iam';
import { createNodeFunction } from './lambda';
import { createEndpoint } from './apigwIntegration';

const awsConfig = new pulumi.Config('aws');
const awsRegion = awsConfig.require('region');
const stack = pulumi.getStack();

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

// create getUser lambda
const getUserLambda = createNodeFunction(rootId, 'getUser', {
  description: 'get user details by id',
  environment: {
    variables: {
      USER_TABLE_NAME: userTableName,
      REGION: awsRegion,
    },
  },
  policies: [tablePolicy],
});

// create createUser lambda
const createUserLambda = createNodeFunction(rootId, 'createUser', {
  description: 'create new user',
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

const getUserRoute = createEndpoint(rootId, {
  name: 'getUser',
  apigw,
  lambda: getUserLambda,
  method: 'GET',
  key: '/users/{userID}',
});

const createUserRoute = createEndpoint(rootId, {
  name: 'createUser',
  apigw,
  lambda: createUserLambda,
  method: 'POST',
  key: '/users',
});

// create stage
const stage = new aws.apigatewayv2.Stage(
  `${rootId}-apiStage`,
  {
    apiId: apigw.id,
    name: stack,
    routeSettings: [
      {
        routeKey: getUserRoute.routeKey,
        throttlingBurstLimit: 5000,
        throttlingRateLimit: 10000,
      },
      {
        routeKey: createUserRoute.routeKey,
        throttlingBurstLimit: 5000,
        throttlingRateLimit: 10000,
      },
    ],
    autoDeploy: true,
  },
  { dependsOn: [getUserRoute, createUserRoute] },
);

// The URL at which the REST API will be served.
export const url = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;
