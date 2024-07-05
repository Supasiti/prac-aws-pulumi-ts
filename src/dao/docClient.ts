import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { log } from '../common/logger';

const region = process.env.REGION;
const maxAttempts = Number(process.env.DDB_MAX_RETRIES) || 3;
const retryDelayOptionsBase = Number(process.env.DDB_RETRY_DELAY_BASE) || 1000;

let _dynamoDBClient: DynamoDBDocumentClient;
const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

function createDocumentClient(
  options: DynamoDBClientConfig,
): DynamoDBDocumentClient {
  const client = new DynamoDBClient({
    region,
    maxAttempts,
    // Date: 2023-09-15
    // Currently DynamoDB does not support RetryStrategyV2 that ConfiguredRetryStrategy implements
    // It will throw "retryStrategy.retry is not a function" error during runtime.
    // retryStrategy: new ConfiguredRetryStrategy(
    //   maxAttempts, // max attempts.
    //   (attempt: number) => retryDelayOptionsBase * attempt, // backoff function.
    // ),
    retryMode: 'STANDARD',
    ...options,
  });

  log.info(
    {
      region,
      maxAttempts,
      retryDelayOptionsBase,
    },
    'Created DynamoDB DynamoDBClient',
  );

  // Create the DynamoDB Document client.
  const translateConfig = { marshallOptions, unmarshallOptions };
  const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);
  return ddbDocClient;
}

export function getDocumentClient(
  options?: DynamoDBClientConfig,
  useCache = true,
): DynamoDBDocumentClient {
  if (useCache && _dynamoDBClient) {
    return _dynamoDBClient;
  }
  _dynamoDBClient = createDocumentClient(options || {});
  return _dynamoDBClient;
}
