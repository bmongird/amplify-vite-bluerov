import { useState, useEffect, useRef, useCallback } from 'react';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

interface BlueROVData {
  messages: Schema["GGmsg"]["type"][];
  lastFetchTime: Date;
  currentPosition: { x: number; y: number } | null;
  batteryInfo: any;
  currentImage: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useBlueROVData = (): BlueROVData => {
  const [messages, setMessages] = useState<Schema["GGmsg"]["type"][]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pollingInterval = useRef<NodeJS.Timeout>();

  const processMessage = useCallback((message: Schema["GGmsg"]["type"]) => {
    try {
      const parsedPayload = typeof message.payload === 'string' 
        ? JSON.parse(message.payload) 
        : message.payload;

      switch (message.id) {
        case "xps-pose":
          setCurrentPosition({
            x: parsedPayload.position.x,
            y: parsedPayload.position.y
          });
          break;
        
        case "xps-pixhawk":
          setBatteryInfo(parsedPayload);
          break;
        
        case "xps-image":
          if (message.image_data) {
            const base64Image = `data:image/jpeg;base64,${message.image_data}`;
            setCurrentImage(base64Image);
          }
          break;
      }
    } catch (error) {
      console.error("Error parsing message payload:", error);
    }
  }, []);

  const fetchAllMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await client.models.GGmsg.list();
      setLastFetchTime(new Date());
      
      // Process each message
      data.forEach(processMessage);
      
      // Filter out image messages from the display array
      const filteredMessages = data.filter(message => message.id !== "xps-image");
      setMessages(filteredMessages);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [processMessage]);

  // Polling setup with visibility change handling
  useEffect(() => {
    const startPolling = () => {
      fetchAllMessages();
      pollingInterval.current = setInterval(fetchAllMessages, 1000);
    };

    const stopPolling = () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    // Initial start
    startPolling();

    // Handle visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAllMessages]);

  return {
    messages,
    lastFetchTime,
    currentPosition,
    batteryInfo,
    currentImage,
    isLoading,
    error
  };
};
