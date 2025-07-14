
import { createContext, useContext, useState, ReactNode } from 'react';

interface PanelVisibility {
  battery: boolean;
  position: boolean;
  sonar: boolean;
  image: boolean;
  sendCommand: boolean;
}

interface SettingsContextType {
  numberOfUUVs: number;
  setNumberOfUUVs: (count: number) => void;
  panelVisibility: PanelVisibility;
  setPanelVisibility: (visibility: PanelVisibility) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [numberOfUUVs, setNumberOfUUVs] = useState(1);
  const [panelVisibility, setPanelVisibility] = useState<PanelVisibility>({
    battery: true,
    position: true,
    sonar: true,
    image: true,
    sendCommand: true,
  });

  const value = {
    numberOfUUVs,
    setNumberOfUUVs,
    panelVisibility,
    setPanelVisibility,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
