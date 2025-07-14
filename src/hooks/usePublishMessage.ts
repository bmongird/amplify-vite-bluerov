import { useState } from 'react';
import { pubsub } from '../utils/pubsub';

interface UsePublishMessageReturn {
  publishMessage: (topic: string, message: string) => Promise<void>;
  lastError: string | null;
  clearError: () => void;
}

export const usePublishMessage = (): UsePublishMessageReturn => {
  const [lastError, setLastError] = useState<string | null>(null);

  const publishMessage = async (topic: string, pubMessage: string): Promise<void> => {
    setLastError(null);
    
    try {
      const msg: any = JSON.parse(pubMessage)
      await pubsub.publish({topics: [topic], message: msg})      
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish message';
      console.error('Failed to publish message:', error);
      setLastError(errorMessage);
      throw error;
    } finally {
    }
  };

  return {
    publishMessage,
    lastError,
    clearError: () => setLastError(null)
  };
};