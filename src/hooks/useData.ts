import { useState, useEffect, useRef, useCallback } from 'react';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { pubsub } from '../utils/pubsub';

const client = generateClient<Schema>();

interface BlueROVData {
  positionInfo: any;
  lastFetchTime: Date;
  currentPosition: { x: number; y: number } | null;
  batteryInfo: any;
  currentImage: string | null;
  error: Error | null;
}

export const useBlueROVData = (): BlueROVData => {
  const [positionInfo, setPositionInfo] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  pubsub.subscribe({topics: ['iot/bluerov/pose/slow', 'iot/bluerov/image/slow', 'iot/bluerov/pixhawk_hw/slow', 'iot/bluerov/speed/slow']}).subscribe({
    next: (data) => {
      processMessage(data);
    },
    error: (error) => console.error(error)
  });

  const processMessage = useCallback((message: any) => {
    try {
      setLastFetchTime(new Date())
      // retrieving topic symbol
      let symbol = Object.getOwnPropertySymbols(message)[0];

      switch (message[symbol]) {
        case "iot/bluerov/pose/slow":
          setCurrentPosition({
            x: message.payload.position.x,
            y: message.payload.position.y
          });
          setPositionInfo(message.payload)
          break;
        
        case "iot/bluerov/pixhawk_hw/slow":
          setBatteryInfo(message.payload);
          break;
        
        case "iot/bluerov/image/slow":
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

  return {
    positionInfo,
    lastFetchTime,
    currentPosition,
    batteryInfo,
    currentImage,
    error
  };
};
