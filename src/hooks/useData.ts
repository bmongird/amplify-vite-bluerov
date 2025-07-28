import { useState, useEffect, useCallback, useMemo } from 'react';
import { pubsub } from '../utils/pubsub';
import { SonarPanelProps } from '../components/panels/sonar';

interface BlueROVData {
  positionInfo: any;
  lastFetchTime: Date;
  allPositions: Record<string, { x: number; y: number }>;
  batteryInfo: any;
  currentImage: string | null;
  error: Error | null;
  sonarProps: SonarPanelProps | null;
}

export const useBlueROVData = (uuv: string | null, totalUUVs: number = 4): BlueROVData => {
  
  // generates initial positions based on num of uuvs
  const initialPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (let i = 0; i < totalUUVs; i++) {
      positions[`uuv${i}`] = { x: 0, y: 0 };
    }
    return positions;
  }, [totalUUVs]);

  const [positionInfo, setPositionInfo] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [allPositions, setAllPositions] = useState(initialPositions);
  const [sonarProps, setSonarProps] = useState<SonarPanelProps | null>(null);

  // generate pose topics
  const poseTopics = useMemo(() => {
    const topics: string[] = [];
    for (let i = 0; i < totalUUVs; i++) {
      topics.push(`iot/uuv${i}/pose`);
    }
    return topics;
  }, [totalUUVs]);

  const processMessage = useCallback((message: any) => {
    try {
      const symbol = Object.getOwnPropertySymbols(message)[0];
      const topic = message[symbol];

      if (!topic) return;

      setLastFetchTime(new Date());

      const poseMatch = topic.match(/^iot\/(uuv[0-9]+)\/pose$/);
      if (poseMatch && message.pose?.position) {
        const uuvId = poseMatch[1];
        console.log(`processing pose messsage for ${uuvId}`)
        const pos = {
          x: message.pose.position.x,
          y: message.pose.position.y
        };
        setAllPositions(prev => ({ ...prev, [uuvId]: pos }));
        if (topic === `iot/${uuv}/pose`){
          setPositionInfo(message.pose);
        }
        return;
      }

      if (topic === `iot/${uuv}/pixhawk_hw` && message.batt_capacity_remaining) {
        setBatteryInfo(message.payload);
        return;
      }

      if (topic === `pipe/detection/result` && message.mask_jpg_b64) {
        const base64ImageMask = `data:image/jpeg;base64,${message.mask_jpg_b64}`;
        const base64ImageOriginal = `data:image/jpeg;base64,${message.original_image}`;
        if (message.cam_side === 'l') {
          setSonarProps(prev => ({
            leftImage: base64ImageMask,
            originalLeftImage: base64ImageOriginal,
            rightImage: prev?.rightImage ?? null,
            originalRightImage: prev?.originalRightImage ?? null,
            pipeDetectedLeft: message.pipe_detected,
            pipeDetectedRight: prev?.pipeDetectedRight ?? null,
          }));
        } else if (message.cam_side === 'r') {
          setSonarProps(prev => ({
            leftImage: prev?.leftImage ?? null,
            originalLeftImage: prev?.originalLeftImage ?? null,
            rightImage: base64ImageMask,
            originalRightImage: base64ImageOriginal,
            pipeDetectedLeft: prev?.pipeDetectedLeft ?? null,
            pipeDetectedRight: message.pipe_detected,
          }));
        }
      }

      if (topic === `iot/${uuv}/image` && message.image_data) {
        const base64Image = `data:image/jpeg;base64,${message.image_data}`;
        setCurrentImage(base64Image);
        return;
      }
    } catch (err) {
      console.error("Error processing message:", err);
      setError(err as Error);
    }
  }, [uuv]);

  // dynamically subscribe to positions depending on num of uuvs
  useEffect(() => {
    const poseSubscription = pubsub.subscribe({
      topics: poseTopics
    }).subscribe({
      next: processMessage,
      error: (err) => {
        console.error(err);
        setError(err);
      }
    });

    return () => poseSubscription.unsubscribe?.();
  }, [poseTopics, processMessage]);

  // add new uuvs
  useEffect(() => {
    setAllPositions(prev => {
      const newPositions = { ...prev };
      
      // set pos of new uuvs
      for (let i = 0; i < totalUUVs; i++) {
        const uuvId = `uuv${i}`;
        if (!newPositions[uuvId]) {
          newPositions[uuvId] = { x: 0, y: 0 };
        }
      }
      
      const validUUVs = new Set();
      for (let i = 0; i < totalUUVs; i++) {
        validUUVs.add(`uuv${i}`);
      }
      
      for (const uuvId in newPositions) {
        if (!validUUVs.has(uuvId)) {
          delete newPositions[uuvId];
        }
      }
      
      return newPositions;
    });
  }, [totalUUVs]);

  useEffect(() => {
    if (!uuv) return;
  
    const subscription = pubsub.subscribe({
      topics: [
        `iot/${uuv}/image`,
        `pipe/detection/result`, // this should change to have an associated uuv
        `iot/${uuv}/pixhawk_hw`
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
      setSonarProps(null);
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
    sonarProps,
  };
};