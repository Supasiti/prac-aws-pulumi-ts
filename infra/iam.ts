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
  resourceArn: string;
};

export function createIAMPolicy(
  params: CreateIAMPolicyParams & { service: string },
) {
  const { policyName, actions } = params;

  const statement = aws.iam.getPolicyDocument({
    statements: [
      {
        actions,
        resources: [],
        effect: params.effect || Effect.ALLOW,
      },
    ],
  });

  return new aws.iam.Policy(policyName, {
    name: policyName,
    policy: statement.then((s) => s.json),
  });
}
