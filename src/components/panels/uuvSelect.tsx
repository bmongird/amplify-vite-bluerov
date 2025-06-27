import { Button } from '@aws-amplify/ui-react';
import React from 'react';
import { Panel } from '../ui/panel';

interface UUVSelectProps {
  uuvSelected: string | null;
  setUUVSelected: (value: string) => void;
}

export const UUVSelectPanel: React.FC<UUVSelectProps> = ({ uuvSelected, setUUVSelected }) => (
  <Panel position={{ top: '20px', left: '50%' }} width="400px" maxHeight="">
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      {['uuv0', 'uuv1', 'uuv2', 'uuv3'].map((uuv) => (
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
