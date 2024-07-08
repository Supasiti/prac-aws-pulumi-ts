// import * as apigatewday from '@pulumi/aws-apigateway';
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

import { createTable } from './dynamodb';
import { createIAMPolicy } from './iam';
import { createNodeLambda } from './lambda';

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

new aws.lambda.Permission(`${rootId}-getUser-permission`, {
  action: 'lambda:InvokeFunction',
  principal: 'apigateway.amazonaws.com',
  function: getUserLambda,
  sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
});

const integration = new aws.apigatewayv2.Integration(
  `${rootId}-getUser-integration`,
  {
    apiId: apigw.id,
    integrationType: 'AWS_PROXY',
    integrationUri: getUserLambda.arn,
    integrationMethod: 'GET',
    payloadFormatVersion: '2.0',
    requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
  },
);

new aws.apigatewayv2.Route(`${rootId}-getUser-route`, {
  apiId: apigw.id,
  routeKey: 'GET /users/{userID}',
  target: pulumi.interpolate`integrations/${integration.id}`,
});

// The URL at which the REST API will be served.
export const url = apigw.apiEndpoint;
