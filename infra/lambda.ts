import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as esbuild from 'esbuild';
import * as fflate from 'fflate';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

function bundle(entry: string) {
  const outdir = 'dist';
  const zipPath = `${outdir}/lambda.zip`;

  rimraf.rimrafSync(outdir);

  esbuild.buildSync({
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    outdir,
    entryPoints: [entry],
  });

  const [outputFile] = fs.readdirSync(outdir);

  const zipContent = fflate.zipSync({
    'index.js': fs.readFileSync(
      path.resolve(process.cwd(), outdir, outputFile),
    ),
  });

  fs.writeFileSync(zipPath, zipContent);

  return new pulumi.asset.FileArchive(zipPath);
}

export type NodeFunctionArgs = aws.lambda.FunctionArgs & {
  entry: string;
};

export class NodeFunction extends aws.lambda.Function {
  constructor(name: string, args: NodeFunctionArgs) {
    const code = bundle(args.entry);

    super(name, {
      ...args,
      code: code,
      packageType: 'Zip',
      runtime: aws.lambda.Runtime.NodeJS20dX,
      handler: 'index.handler',
    });
  }
}

export type CreateNodeLambdaArgs = Partial<NodeFunctionArgs> & {
  policies?: aws.iam.Policy[];
};

export function createNodeLambda(
  id: string,
  fnName: string,
  args: CreateNodeLambdaArgs,
) {
  const { policies = [], ...nodeFnArgs } = args;
  const lambdaId = `${id}-${fnName}`;
  const lambdaRole = createLambdaRole(lambdaId);

  // attach basic policy
  new aws.iam.RolePolicyAttachment(`${lambdaId}-roleAttachment-basic`, {
    role: lambdaRole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });

  attachRolePolicies(lambdaId, lambdaRole, policies);

  return new NodeFunction(lambdaId, {
    ...nodeFnArgs,
    entry: `../src/handlers/${fnName}.ts`,
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
