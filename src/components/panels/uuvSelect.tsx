import { Button } from '@aws-amplify/ui-react';
import React from 'react';
import { Panel } from '../ui/panel';
import { useSettings } from '../../hooks/useSettings';

interface UUVSelectProps {
  uuvSelected: string | null;
  setUUVSelected: (value: string) => void;
}

export const UUVSelectPanel: React.FC<UUVSelectProps> = ({ uuvSelected, setUUVSelected }) => {
  const { numberOfUUVs } = useSettings();
  const uuvs = Array.from({ length: numberOfUUVs }, (_, i) => `uuv${i}`);

  return (
    <Panel position={{ top: '20px', left: '50%' }} width="400px" maxHeight="">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {uuvs.map((uuv) => (
          <Button
            key={uuv}
            variation={uuv === uuvSelected ? 'primary' : 'menu'}
            onClick={() => setUUVSelected(uuv)}
          >
            {uuv}
          </Button>
        ))}
      </div>
    </Panel>
  );
};
