import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

export type CreateNodeLambdaArgs = Partial<aws.lambda.FunctionArgs> & {
  policies?: aws.iam.Policy[];
};

export function createNodeFunction(
  id: string,
  fnName: string,
  args: CreateNodeLambdaArgs,
) {
  const { policies = [], ...fnArgs } = args;
  const lambdaId = `${id}-${fnName}`;
  const lambdaRole = createLambdaRole(lambdaId);

  // attach basic policy
  new aws.iam.RolePolicyAttachment(`${lambdaId}-roleAttachment-basic`, {
    role: lambdaRole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });

  attachRolePolicies(lambdaId, lambdaRole, policies);

  return new aws.lambda.Function(lambdaId, {
    ...fnArgs,
    code: new pulumi.asset.FileArchive(`../dist/${fnName}.zip`),
    packageType: 'Zip',
    runtime: aws.lambda.Runtime.NodeJS18dX,
    handler: 'index.handler',
    name: lambdaId,
    role: lambdaRole.arn,
  });
}

function createLambdaRole(id: string) {
  return new aws.iam.Role(`${id}-role`, {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
          Effect: 'Allow',
          Sid: '',
        },
      ],
    },
  });
}

function attachRolePolicies(
  id: string,
  role: aws.iam.Role,
  policies: aws.iam.Policy[],
) {
  for (const p of policies) {
    p.name.apply(
      (name) =>
        new aws.iam.RolePolicyAttachment(`${id}-roleAttachment-${name}`, {
          role: role,
          policyArn: p.arn,
        }),
    );
  }
}
