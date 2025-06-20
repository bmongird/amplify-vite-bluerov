import React from 'react';

interface LastUpdatedIndicatorProps {
  lastFetchTime: Date;
}

export const LastUpdatedIndicator: React.FC<LastUpdatedIndicatorProps> = ({
  lastFetchTime
}) => (
  <div style={{
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    color: 'white',
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 15
  }}>
    Last updated: {lastFetchTime.toLocaleTimeString()}
  </div>
);