import React from 'react';
import { useBlueROVData } from '../../hooks/useData';
import { useBackgroundImageDimensions } from '../../hooks/useBackground';

import { BackgroundMap } from '../background/background';
import { PositionMarker } from '../marker/marker';
import { PositionPanel } from '../panels/position';
import { BatteryPanel } from '../panels/battery';
import { ImagePanel } from '../panels/image';
import { LastUpdatedIndicator } from '../panels/lastUpdated';

import Background from '../../assets/ss_opensea.png';


export const BlueROVDashboard: React.FC = (
  ) => {
  const {
    positionInfo,
    lastFetchTime,
    currentPosition,
    batteryInfo,
    currentImage,
    error
  } = useBlueROVData();

  const {
    backgroundImageDimensions,
    backgroundContainerRef
  } = useBackgroundImageDimensions(Background);

  if (error) {
    return (
      <div className="error-container">
        <h2>Connection Error</h2>
        <p>Unable to connect to sim: {error.message}</p>
      </div>
    );
  }

  return (
    <BackgroundMap 
      backgroundImage={Background}
      containerRef={backgroundContainerRef}
    >
      <PositionMarker 
        position={currentPosition}
        backgroundImageDimensions={backgroundImageDimensions}
      />

      <PositionPanel 
        positionInfo={positionInfo}
      />

      <BatteryPanel 
        batteryInfo={batteryInfo}
      />

      <ImagePanel 
        currentImage={currentImage}
      />

      <LastUpdatedIndicator 
        lastFetchTime={lastFetchTime}
      />
    </BackgroundMap>
  );
};
