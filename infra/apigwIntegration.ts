import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { NodeFunction } from './lambda';

export type RouteApiArgs = {
  apigw: aws.apigatewayv2.Api;
  lambda: NodeFunction;
  method: string;
  key: string;
  name: string;
};

export function routeApi(id: string, args: RouteApiArgs) {
  const { apigw, lambda, method, key, name } = args;
  const intName = `${id}-${name}`;

  new aws.lambda.Permission(`${intName}-permission`, {
    action: 'lambda:InvokeFunction',
    principal: 'apigateway.amazonaws.com',
    function: lambda,
    sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
  });

  const integration = new aws.apigatewayv2.Integration(
    `${intName}-integration`,
    {
      apiId: apigw.id,
      integrationType: 'AWS_PROXY',
      integrationUri: lambda.arn,
      integrationMethod: method,
      payloadFormatVersion: '2.0',
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    },
  );

  new aws.apigatewayv2.Route(`${intName}-route`, {
    apiId: apigw.id,
    routeKey: `${method} ${key}`,
    target: pulumi.interpolate`integrations/${integration.id}`,
  });
}
