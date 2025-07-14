import { PubSub } from '@aws-amplify/pubsub';

// Apply plugin with configuration
export const pubsub = new PubSub({
    region: 'us-east-2',
    endpoint:
      '{ENDPOINT}'
  });