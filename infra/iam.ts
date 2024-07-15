import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

export enum Effect {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export type CreateIAMPolicyParams = {
  actions: string[];
  effect?: Effect;
  policyName: string;
  resourceArn: pulumi.Output<string> | string;
};

export function createIAMPolicy(params: CreateIAMPolicyParams) {
  const { policyName, actions, resourceArn } = params;

  const policy = pulumi.jsonStringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: actions,
        Resource: resourceArn,
        Effect: params.effect || Effect.ALLOW,
      },
    ],
  });

  return new aws.iam.Policy(policyName, {
    name: policyName,
    policy,
  });
}
