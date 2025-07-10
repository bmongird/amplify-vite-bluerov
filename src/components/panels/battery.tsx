import React, { useState } from 'react';
import { CollapsiblePanel } from '../ui/collapsiblePanel';

interface BatteryPanelProps {
  batteryInfo: any;
}

export const BatteryPanel: React.FC<BatteryPanelProps> = ({ batteryInfo }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getBatteryLevel = () => {
    if (!batteryInfo) return null;
    
    // Extract battery percentage if available in the data structure
    if (typeof batteryInfo === 'object' && batteryInfo.battery_remaining_pct) {
      return `${batteryInfo.battery_remaining_pct}%`;
    }
    
    return JSON.stringify(batteryInfo);
  };

  const batteryLevel = getBatteryLevel();

  return (
    <CollapsiblePanel
      title="Battery Status"
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      position={{ top: '10px', left: '50px' }}
      width="200px"
      maxHeight="200px"
    >
      <div style={{ textAlign: 'center' }}>
        {batteryLevel ? (
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              {batteryLevel}
            </p>
        ) : (
          <p style={{ margin: 0, color: '#888', fontStyle: 'italic' }}>
            No battery data
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
};
