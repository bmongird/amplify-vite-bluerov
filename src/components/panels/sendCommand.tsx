import React, { useState } from "react";
import { usePublishMessage } from "../../hooks/usePublishMessage";
import { CollapsiblePanel } from "../ui/collapsiblePanel";

interface SendCommandProps {
  uuvID: string | null
}

export const SendCommandPanel: React.FC<SendCommandProps> = ({ uuvID }) => {
  const { publishMessage, lastError, clearError } = usePublishMessage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [commandText, setCommandText] = useState('{\n "msg": "hello"\n}');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const isValidJSON = (text: string): boolean => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleSendCommand = async (): Promise<void> => {
    if (!uuvID) {
      alert('No device selected');
      return;
    }

    const messageToSend = commandText.trim() || `"hello"`;
    
    if (!isValidJSON(messageToSend)) {
      alert('Please enter valid JSON format');
      return;
    }

    setSendStatus('sending');
    
    try {
      await publishMessage(`iot/${uuvID}/commands`, messageToSend);
      setSendStatus('success');
      // Reset status after 1 seconds
      setTimeout(() => setSendStatus('idle'), 1000);
    } catch (error) {
      setSendStatus('error');
      // Reset status after 2 seconds
      setTimeout(() => setSendStatus('idle'), 2000);
    }
  };

  const isButtonDisabled = () => {
    return sendStatus != 'idle' || uuvID === null;
  };

  const getButtonStyle = () => {
    const baseStyle = {
      padding: '6px 12px',
      fontSize: '12px',
      border: 'none',
      borderRadius: '4px',
      cursor: isButtonDisabled() ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      alignSelf: 'center',
      minWidth: '60px',
      opacity: uuvID === null ? 0.5 : 1
    };

    switch (sendStatus) {
      case 'sending':
        return { ...baseStyle, backgroundColor: '#6c757d', color: 'white' };
      case 'success':
        return { ...baseStyle, backgroundColor: '#28a745', color: 'white' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#dc3545', color: 'white' };
      default:
        return { ...baseStyle, backgroundColor: '#007bff', color: 'white' };
    }
  };

  const getButtonText = () => {
    if (uuvID === null) {
      return 'No Device';
    }
    
    switch (sendStatus) {
      case 'sending':
        return 'Sending...';
      case 'success':
        return 'Sent ✓';
      case 'error':
        return 'Failed ✗';
      default:
        return 'Send';
    }
  };

  return (
    <CollapsiblePanel
      title="Send a command"
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      position={{ bottom: '20px', right: '10px' }}
      width="400px"
      maxHeight="200px"
    >
      <div style={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <textarea
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          placeholder="Enter command..."
          rows={3}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSendCommand}
          disabled={isButtonDisabled()}
          style={getButtonStyle()}
          onMouseEnter={(e) => {
            if (sendStatus === 'idle' && uuvID !== null) {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (sendStatus === 'idle' && uuvID !== null) {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
          onMouseDown={(e) => {
            if (sendStatus === 'idle' && uuvID !== null) {
              e.currentTarget.style.transform = 'translateY(1px)';
            }
          }}
          onMouseUp={(e) => {
            if (sendStatus === 'idle' && uuvID !== null) {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
        >
          {getButtonText()}
        </button>
      </div>
    </CollapsiblePanel>
  );
};