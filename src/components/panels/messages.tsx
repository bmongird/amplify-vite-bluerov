import React, { useState } from 'react';
import type { Schema } from '../../../amplify/data/resource';
import { CollapsiblePanel } from '../ui/collapsiblePanel';

interface MessagesPanelProps {
  messages: Schema["GGmsg"]["type"][];
  isLoading: boolean;
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({
  messages,
  isLoading
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderMessage = (message: Schema["GGmsg"]["type"]) => {
    try {
      const parsedPayload = typeof message.payload === 'string' 
        ? JSON.parse(message.payload) 
        : message.payload;
      
      return (
        <li key={message.id} style={{ 
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: 'rgba(248, 249, 250, 0.8)',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          <pre style={{ 
            fontSize: '11px',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
          }}>
            {JSON.stringify(parsedPayload, null, 2)}
          </pre>
        </li>
      );
    } catch (error) {
      console.error('JSON parse error:', error);
      return null;
    }
  };

  return (
    <CollapsiblePanel
      title="Messages"
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      position={{ top: '20px', right: '20px' }}
      width="350px"
      maxHeight="400px"
    >
      <div style={{ 
        maxHeight: '320px', 
        overflowY: 'auto',
        transition: 'all 0.3s ease-in-out'
      }}>
        {/* {isLoading && (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
            Loading messages...
          </p>
        )} */}
        
        {!isLoading && messages.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
            No messages yet
          </p>
        ) : (
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            textAlign: 'left'
          }}>
            {messages.map(renderMessage)}
          </ul>
        )}
      </div>
    </CollapsiblePanel>
  );
};