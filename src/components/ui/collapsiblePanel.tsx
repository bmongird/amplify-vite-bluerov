import React from 'react';

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
  <div style={{
    position: 'absolute',
    ...position,
    width,
    maxHeight: isCollapsed ? 'auto' : maxHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(5px)',
    overflow: 'auto',
    zIndex: 20,
    transition: 'all 0.3s ease-in-out'
  }}>
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
  </div>
);