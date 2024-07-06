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
  resourceArn: pulumi.Output<string>;
};

export function createIAMPolicy(params: CreateIAMPolicyParams) {
  const { policyName, actions, resourceArn } = params;

  return new aws.iam.Policy(policyName, {
    name: policyName,
    policy: resourceArn.apply((arn) =>
      JSON.stringify({
        statements: [
          {
            actions,
            resources: [arn],
            effect: params.effect || Effect.ALLOW,
          },
        ],
      }),
    ),
  });
}
