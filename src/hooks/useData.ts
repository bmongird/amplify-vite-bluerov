import { useState, useEffect, useCallback } from 'react';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { pubsub } from '../utils/pubsub';

const client = generateClient<Schema>();

interface BlueROVData {
  positionInfo: any;
  lastFetchTime: Date;
  allPositions: Record<string, { x: number; y: number }>;
  batteryInfo: any;
  currentImage: string | null;
  error: Error | null;
}

const initialPositions: Record<string, { x: number; y: number }> = {
  uuv0: { x: 0, y: 0 },
  uuv1: { x: 0, y: 0 },
  uuv2: { x: 0, y: 0 },
  uuv3: { x: 0, y: 0 },
};

export const useBlueROVData = (uuv: string | null): BlueROVData => {
  const [positionInfo, setPositionInfo] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [allPositions, setAllPositions] = useState(initialPositions);

  const processMessage = useCallback((message: any) => {
    try {
      const symbol = Object.getOwnPropertySymbols(message)[0];
      const topic = message[symbol];

      if (!topic) return;

      setLastFetchTime(new Date());

      // Match pose topic
      const poseMatch = topic.match(/^iot\/(uuv[0-9])\/pose\/slow$/);
      if (poseMatch && message.payload?.position) {
        const uuvId = poseMatch[1];
        const pos = {
          x: message.payload.position.x,
          y: message.payload.position.y
        };
        setAllPositions(prev => ({ ...prev, [uuvId]: pos }));
        if (topic === `iot/${uuv}/pose/slow`){
          setPositionInfo(message.payload);
        }
        return;
      }

      if (topic === `iot/${uuv}/pixhawk_hw/slow` && message.payload) {
        setBatteryInfo(message.payload);
        return;
      }

      if (topic === `iot/${uuv}/image/slow` && message.image_data) {
        const base64Image = `data:image/jpeg;base64,${message.image_data}`;
        setCurrentImage(base64Image);
        return;
      }
    } catch (err) {
      console.error("Error processing message:", err);
      setError(err as Error);
    }
  }, [uuv]);

  useEffect(() => {
    // Static pose subscriptions
    const poseSubscription = pubsub.subscribe({
      topics: [
        `iot/uuv0/pose/slow`,
        `iot/uuv1/pose/slow`,
        `iot/uuv2/pose/slow`,
        `iot/uuv3/pose/slow`,
      ]
    }).subscribe({
      next: processMessage,
      error: (err) => {
        console.error(err);
        setError(err);
      }
    });

    return () => poseSubscription.unsubscribe?.();
  }, [processMessage]);

  useEffect(() => {
    if (!uuv) return;
  
    const subscription = pubsub.subscribe({
      topics: [
        `iot/${uuv}/image/slow`,
        `iot/${uuv}/pixhawk_hw/slow`,
      ]
    }).subscribe({
      next: processMessage,
      error: (err) => {
        console.error(err);
        setError(err);
      }
    });
  
    return () => {
      subscription.unsubscribe?.();
      setPositionInfo(null);
      setBatteryInfo(null);
      setCurrentImage(null);
      setError(null);
    };
  }, [uuv, processMessage]);

  return {
    positionInfo,
    lastFetchTime,
    allPositions,
    batteryInfo,
    currentImage,
    error,
  };
};
