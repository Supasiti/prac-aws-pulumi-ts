import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

import { rootId } from '../constant';
import { createIAMPolicy } from './iam';
import { createNodeFunction } from './lambda';
import { createEndpoint } from './apigwIntegration';

const awsConfig = new pulumi.Config('aws');
const awsRegion = awsConfig.require('region');
const env = pulumi.getStack();

const resources = new pulumi.StackReference(
  `Supasiti/prac-aws-pulumi-thara-resources/${env}`,
);
const table = resources.getOutput('table') as pulumi.Output<aws.dynamodb.Table>;

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
      USER_TABLE_NAME: table.name,
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
      USER_TABLE_NAME: table.name,
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
    name: env,
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
