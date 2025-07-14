// Not using this anymore, switched to the leaflet built in markers

import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface PositionMarkerProps {
  uuvID: string;
  selectedUUVId: string | null;
  position: { x: number; y: number } | null;
  backgroundImageDimensions: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } | null;
  color?: string; // optional, defaults to red
}

export const PositionMarker: React.FC<PositionMarkerProps> = ({
  uuvID,
  selectedUUVId,
  position,
  backgroundImageDimensions,
  color = 'red'
}) => {
  if (!position || !backgroundImageDimensions) return null;

  const convertToScreenPosition = (x: number, y: number) => {
    const imageX = ((x + 300) / 600) * backgroundImageDimensions.width;
    const imageY = ((150 - y) / 300) * backgroundImageDimensions.height;

    const screenX = imageX + backgroundImageDimensions.offsetX;
    const screenY = imageY + backgroundImageDimensions.offsetY;

    return { screenX, screenY };
  };

  const { screenX, screenY } = convertToScreenPosition(position.x, position.y);
  const isSelected = uuvID === selectedUUVId;
  const tooltipId = `tooltip-${uuvID}`;

  return (
    <>
      <Tooltip id={tooltipId} />
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-content={`UUV: ${uuvID}\nPosition: (${position.x.toFixed(2)}, ${position.y.toFixed(2)})`}
        style={{
          position: 'absolute',
          left: `${screenX - 10}px`,
          top: `${screenY - 10}px`,
          width: '20px',
          height: '20px',
          backgroundColor: color,
          borderRadius: '50%',
          border: '1px solid white',
          boxShadow: isSelected
            ? '0 0 10px 4px rgba(255, 255, 255, 1)'
            : '0 2px 8px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer'
        }}
      />
    </>
  );
};
