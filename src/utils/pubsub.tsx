import { PubSub } from '@aws-amplify/pubsub';

// Apply plugin with configuration
export const pubsub = new PubSub({
    region: 'us-east-2',
    endpoint:
      'wss://a3sa7caljdtq41-ats.iot.us-east-2.amazonaws.com/mqtt'
  });