import { useState, useEffect, useRef } from 'react';

interface BackgroundImageDimensions {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export const useBackgroundImageDimensions = (backgroundImageSrc: string) => {
  const [backgroundImageDimensions, setBackgroundImageDimensions] = 
    useState<BackgroundImageDimensions | null>(null);
  const backgroundContainerRef = useRef<HTMLDivElement>(null);

  const calculateBackgroundImageDimensions = () => {
    if (!backgroundContainerRef.current) return;

    const container = backgroundContainerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const img = new Image();
    img.onload = () => {
      const imageAspectRatio = img.naturalWidth / img.naturalHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      let scale, offsetX, offsetY;

      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider, scale to fit height, crop width
        scale = containerHeight / img.naturalHeight;
        offsetX = (containerWidth - (img.naturalWidth * scale)) / 2;
        offsetY = 0;
      } else {
        // Image is taller, scale to fit width, crop height  
        scale = containerWidth / img.naturalWidth;
        offsetX = 0;
        offsetY = (containerHeight - (img.naturalHeight * scale)) / 2;
      }

      setBackgroundImageDimensions({
        width: img.naturalWidth * scale,
        height: img.naturalHeight * scale,
        offsetX,
        offsetY
      });
    };
    img.src = backgroundImageSrc;
  };

  useEffect(() => {
    calculateBackgroundImageDimensions();
    
    const handleResize = () => {
      calculateBackgroundImageDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [backgroundImageSrc]);

  return {
    backgroundImageDimensions,
    backgroundContainerRef
  };
};