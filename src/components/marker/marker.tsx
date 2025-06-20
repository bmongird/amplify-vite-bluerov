import React from 'react';

interface PositionMarkerProps {
  position: { x: number; y: number } | null;
  backgroundImageDimensions: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } | null;
}

export const PositionMarker: React.FC<PositionMarkerProps> = ({
  position,
  backgroundImageDimensions
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

  return (
    <div style={{
      position: 'absolute',
      left: `${screenX - 10}px`,
      top: `${screenY - 10}px`,
      width: '20px',
      height: '20px',
      backgroundColor: 'red',
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      zIndex: 10,
      transition: 'all 0.3s ease-in-out',
    }} />
  );
};