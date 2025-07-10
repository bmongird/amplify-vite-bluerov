import React, { useState } from 'react';
import { CollapsiblePanel } from '../ui/collapsiblePanel';

interface ImagePanelProps {
  currentImage: string | null;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ currentImage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error('Image failed to load');
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <CollapsiblePanel
      title="Live Image Feed"
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      position={{ bottom: '10px', left: '10px' }}
      width="300px"
      maxHeight="350px"
    >
      <div style={{
        maxHeight: '280px',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {currentImage && !imageError ? (
          <img 
            src={currentImage}
            alt="Live feed"
            style={{
              maxWidth: '100%',
              maxHeight: '260px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              objectFit: 'contain'
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <p style={{ 
            color: '#888', 
            fontStyle: 'italic',
            margin: 0,
            padding: '20px'
          }}>
            {imageError ? 'Failed to load image' : 'No image available'}
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
};