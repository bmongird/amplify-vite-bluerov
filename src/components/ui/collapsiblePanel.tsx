import React from 'react';
import { Panel } from './panel';

interface CollapsiblePanelProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  width: string;
  maxHeight: string;
  children: React.ReactNode;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  isCollapsed,
  onToggle,
  position,
  width,
  maxHeight,
  children
}) => (
  <Panel
    position={position}
    width={width}
    maxHeight={isCollapsed ? 'auto' : maxHeight}
  >
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isCollapsed ? '0' : '12px'
    }}>
      <h3 style={{
        fontSize: '16px',
        color: '#333',
        margin: '0',
        fontWeight: '600',
        textAlign: 'left'
      }}>
        {title}
      </h3>
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: '3px',
          color: '#666',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {isCollapsed ? '▼' : '▲'}
      </button>
    </div>
    {!isCollapsed && children}
  </Panel>
);
