import React, { useState } from 'react';
import { CollapsiblePanel } from '../ui/collapsiblePanel';

interface PositionPanelProps {
  positionInfo: any;
}

export const PositionPanel: React.FC<PositionPanelProps> = ({
  positionInfo
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderMessage = (message: any) => {
    try {
      
      return (
          <pre style={{ 
            fontSize: '11px',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
          }}>
            {JSON.stringify(message, null, 2)}
          </pre>
      );
    } catch (error) {
      console.error('JSON parse error:', error);
      return null;
    }
  };

  return (
    <CollapsiblePanel
      title="Position"
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      position={{right:'275px', top:'10px'}}
      width="250px"
      maxHeight="400px"
    >
      <div style={{ 
        maxHeight: '320px', 
        overflowY: 'auto',
        transition: 'all 0.3s ease-in-out'
      }}>  
        {!positionInfo ? (
          <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
            No position data available
          </p>
        ) : (
          <>
            {renderMessage(positionInfo)}
          </>
        )}
      </div>
    </CollapsiblePanel>
  );
};