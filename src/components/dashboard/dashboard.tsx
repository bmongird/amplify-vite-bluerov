import React, { useState } from 'react';
import { useBlueROVData } from '../../hooks/useData';
import { useBackgroundImageDimensions } from '../../hooks/useBackground';
import { BackgroundMap } from '../background/background';
import { PositionMarker } from '../marker/marker';
import { PositionPanel } from '../panels/position';
import { BatteryPanel } from '../panels/battery';
import { ImagePanel } from '../panels/image';
import { LastUpdatedIndicator } from '../panels/lastUpdated';
import { SendCommandPanel } from '../panels/sendCommand';
import { UUVSelectPanel } from '../panels/uuvSelect'

import Background from '../../assets/ss_opensea.png';


export const BlueROVDashboard: React.FC = (
  ) => {
  const [uuvSelected, setUUVSelected] = useState<string | null>(null);

  const colors = ['red', 'blue', 'green', 'yellow'];
  
  const {
    positionInfo,
    lastFetchTime,
    allPositions,
    batteryInfo,
    currentImage,
    error
  } = useBlueROVData(uuvSelected);

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
        <UUVSelectPanel uuvSelected={uuvSelected} setUUVSelected={setUUVSelected}/>
        {Object.entries(allPositions).map(([uuvId, position], index) => (
          <PositionMarker
            key={uuvId}
            uuvID={uuvId}
            selectedUUVId={uuvSelected}
            position={position}
            color={colors[index % colors.length]}
            backgroundImageDimensions={backgroundImageDimensions}
          />
        ))}


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

          <SendCommandPanel uuvID={uuvSelected}/>
      </BackgroundMap>
  );
};
