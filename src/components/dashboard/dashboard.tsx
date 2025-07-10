import React, { useState, useMemo } from 'react';
import { useBlueROVData } from '../../hooks/useData';
import { useBackgroundImageDimensions } from '../../hooks/useBackground';
import { useSettings } from '../../hooks/useSettings';
import { BackgroundMap } from '../background/background';
import { LeafletMarker } from '../marker/leafletMarker';
import { PositionPanel } from '../panels/position';
import { BatteryPanel } from '../panels/battery';
import { ImagePanel } from '../panels/image';
import { LastUpdatedIndicator } from '../panels/lastUpdated';
import { SendCommandPanel } from '../panels/sendCommand';
import { UUVSelectPanel } from '../panels/uuvSelect'
import { Settings } from '../panels/settings';
import { convertToLatLng } from '../../utils/position';
import { SonarPanel } from '../panels/sonar';

export const BlueROVDashboard: React.FC = () => {
  const [uuvSelected, setUUVSelected] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.8120, -122.4058]);
  const { numberOfUUVs, panelVisibility } = useSettings();
  
  const colors = useMemo(() => {
    const baseColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    return baseColors.slice(0, numberOfUUVs);
  }, [numberOfUUVs]);

  const {
    positionInfo,
    lastFetchTime,
    allPositions,
    batteryInfo,
    currentImage,
    error,
    sonarProps,
  } = useBlueROVData(uuvSelected, numberOfUUVs);

  const {
    backgroundImageDimensions,
    backgroundContainerRef
  } = useBackgroundImageDimensions('');

  React.useEffect(() => {
    if (uuvSelected && allPositions[uuvSelected]) {
      const { x, y } = allPositions[uuvSelected];
      const [lat, lng] = convertToLatLng(x, y);
      setMapCenter([lat, lng]);
    }
  }, [uuvSelected, allPositions]);

  if (error) {
    return (
      <div className="error-container">
        <h2>Connection Error</h2>
        <p>Unable to connect to sim: {error.message}</p>
      </div>
    );
  }

  const leafletMarkers = Object.entries(allPositions).map(([uuvId, position], index) => (
    <LeafletMarker
      key={uuvId}
      uuvID={uuvId}
      selectedUUVId={uuvSelected}
      position={position}
      color={colors[index % colors.length]}
    />
  ));

  return (
    <BackgroundMap
      containerRef={backgroundContainerRef}
      mapChildren={leafletMarkers}
      mapCenter={mapCenter}
    >
      <UUVSelectPanel 
        uuvSelected={uuvSelected} 
        setUUVSelected={setUUVSelected}
      />
      <Settings />
      {panelVisibility.position && (
        <PositionPanel
          positionInfo={positionInfo}
        />
      )}
      {panelVisibility.battery && (
        <BatteryPanel
          batteryInfo={batteryInfo}
        />
      )}
      {panelVisibility.image && (
        <ImagePanel
          currentImage={currentImage}
        />
      )}
      {panelVisibility.sonar && (
        <SonarPanel
          leftImage={sonarProps?.leftImage ?? null}
          originalLeftImage={sonarProps?.originalLeftImage ?? null}
          originalRightImage={sonarProps?.originalRightImage ?? null}
          rightImage={sonarProps?.rightImage ?? null}
          pipeDetectedLeft={sonarProps?.pipeDetectedLeft ?? null}
          pipeDetectedRight={sonarProps?.pipeDetectedRight ?? null}
        />
      )}
      <LastUpdatedIndicator
        lastFetchTime={lastFetchTime}
      />
      {panelVisibility.sendCommand && (
        <SendCommandPanel uuvID={uuvSelected}/>
      )}
    </BackgroundMap>
  );
};