import React, { RefObject } from 'react';

interface BackgroundMapProps {
  backgroundImage: string;
  containerRef: RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const BackgroundMap: React.FC<BackgroundMapProps> = ({
  backgroundImage,
  containerRef,
  children
}) => (
  <div 
    ref={containerRef}
    style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      margin: 0,
      padding: 0
    }}
  >
    {children}
  </div>
);
