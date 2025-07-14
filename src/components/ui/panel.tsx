import React from 'react';

interface PanelProps {
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  width: string;
  maxHeight: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  position,
  width,
  maxHeight,
  style,
  children
}) => (
  <div
    style={{
      position: 'absolute',
      ...position,
      width,
      transform: position.left === '50%' ? 'translateX(-50%)' : undefined,
      maxHeight,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(5px)',
      overflow: 'auto',
      zIndex: 20,
      transition: 'all 0.3s ease-in-out',
      ...style
    }}
  >
    {children}
  </div>
);
