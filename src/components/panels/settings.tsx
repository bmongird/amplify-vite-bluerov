
import { useState } from 'react';
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { CollapsiblePanel } from '../ui/collapsiblePanel';

export const Settings = () => {
  const { numberOfUUVs, setNumberOfUUVs, panelVisibility, setPanelVisibility } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUUVCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumberOfUUVs(Number(event.target.value));
  };

  const handleVisibilityChange = (panelName: keyof typeof panelVisibility) => {
    setPanelVisibility({
      ...panelVisibility,
      [panelName]: !panelVisibility[panelName],
    });
  };

  return (
    <CollapsiblePanel title="Settings" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} position={{top:'10px', right:'10px'}} width={'225px'} maxHeight='325px'>
      <div>
        <label>
          Number of UUVs: {numberOfUUVs}
          <input
            type="range"
            min="1"
            max="6"
            value={numberOfUUVs}
            onChange={handleUUVCountChange}
          />
        </label>
      </div>
      <div>
        <h4>Visible Panels</h4>
        {Object.keys(panelVisibility).map((panelName) => (
          <div key={panelName}>
            <label>
              <input
                type="checkbox"
                checked={panelVisibility[panelName as keyof typeof panelVisibility]}
                onChange={() => handleVisibilityChange(panelName as keyof typeof panelVisibility)}
              />
              {panelName}
            </label>
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  );
};

