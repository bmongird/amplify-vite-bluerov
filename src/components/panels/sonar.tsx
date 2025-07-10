import React, { useState } from 'react';
import { CollapsiblePanel } from '../ui/collapsiblePanel';

export interface SonarPanelProps {
  leftImage: string | null;
  rightImage: string | null;
  originalLeftImage: string | null;
  originalRightImage: string | null;
  pipeDetectedLeft: boolean | null;
  pipeDetectedRight: boolean | null;
}

export const SonarPanel: React.FC<SonarPanelProps> = ({ leftImage, rightImage, originalLeftImage, originalRightImage, pipeDetectedLeft, pipeDetectedRight }) => {
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
      title="Sonar"
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      position={{ top: '25%', left: '10px' }}
      width="425px"
      maxHeight="200px"
    >
      <div style={{
        maxHeight: '280px',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {!imageError ? (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {originalLeftImage ? (
                  <img
                      src={originalLeftImage}
                      alt="Original Left Sonar"
                      style={{
                        width: '180px',
                        height: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        objectFit: 'contain',
                        marginBottom: '5px'
                      }}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                  />
                ) : <div style={{width: '180px', height: '16px', border: '1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', color: '#888', marginBottom: '5px'}}>No original left image</div>}
                {leftImage ? (
                  <img
                      src={leftImage}
                      alt="Left Sonar Mask"
                      style={{
                        width: '180px',
                        height: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        objectFit: 'contain'
                      }}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                  />
                ) : <div style={{width: '180px', height: '16px', border: '1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', color: '#888'}}>No left mask</div>}
                <p>Pipe detected: {String(pipeDetectedLeft ?? 'N/A')}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {originalRightImage ? (
                  <img
                    src={originalRightImage}
                    alt="Original Right Sonar"
                    style={{
                        width: '180px',
                        height: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        objectFit: 'contain',
                        marginBottom: '5px'
                    }}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : <div style={{width: '180px', height: '16px', border: '1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', color: '#888', marginBottom: '5px'}}>No original right image</div>}
                {rightImage ? (
                  <img
                    src={rightImage}
                    alt="Right Sonar Mask"
                    style={{
                        width: '180px',
                        height: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        objectFit: 'contain'
                    }}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : <div style={{width: '180px', height: '16px', border: '1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', color: '#888'}}>No right mask</div>}
                <p>Pipe detected: {String(pipeDetectedRight ?? 'N/A')}</p>
              </div>
            </div>
        ) : (
          <p style={{
            color: '#888',
            fontStyle: 'italic',
            margin: 0,
            padding: '20px'
          }}>
            {'Failed to load images'}
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
};