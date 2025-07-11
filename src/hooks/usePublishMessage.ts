import { useState } from 'react';
import { pubsub } from '../utils/pubsub';

// interface PublishMessage {
//   command: string;
//   timestamp: string;
// }

interface UsePublishMessageReturn {
  publishMessage: (topic: string, message: string) => Promise<void>;
  lastError: string | null;
  clearError: () => void;
}

// Custom hook for publishing messages
export const usePublishMessage = (): UsePublishMessageReturn => {
  const [lastError, setLastError] = useState<string | null>(null);

  const publishMessage = async (topic: string, pubMessage: string): Promise<void> => {
    setLastError(null);
    
    try {
      console.log('Publishing to topic:', topic);
      console.log('Message:', pubMessage);
      const msg: any = JSON.parse(pubMessage)
      await pubsub.publish({topics: [topic], message: msg})      
      console.log('Message published successfully!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish message';
      console.error('Failed to publish message:', error);
      setLastError(errorMessage);
      throw error; // Re-throw so calling component can handle it
    } finally {
    }
  };

  return {
    publishMessage,
    lastError,
    clearError: () => setLastError(null)
  };
};