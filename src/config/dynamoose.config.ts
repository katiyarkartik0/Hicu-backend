import * as dynamoose from 'dynamoose';

export const configureDynamoose = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      dynamoose.aws.ddb.local(process.env.DYNAMODB_ENDPOINT);
      console.log(
        '[Dynamoose] Connected to local DB:',
        process.env.DYNAMODB_ENDPOINT,
      );
      break;

    default:
      console.log('[Dynamoose] No valid NODE_ENV set. Connecting to local DB.');
      dynamoose.aws.ddb.local(
        process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
      );
  }
};