import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { convertToLatLng } from '../../utils/position.js';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMarkerProps {
  uuvID: string;
  selectedUUVId: string | null;
  position: { x: number; y: number } | null;
  color?: string;
}

export const LeafletMarker: React.FC<LeafletMarkerProps> = ({
  uuvID,
  selectedUUVId,
  position,
  color = 'red'
}) => {
  if (!position) return null;

  const [lat, lng] = convertToLatLng(position.x, position.y);
  const isSelected = uuvID === selectedUUVId;

  // Create custom icon based on color and selection state
  const createCustomIcon = (color: string, selected: boolean) => {
    const size = selected ? 30 : 20;
    const iconHtml = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: ${selected ? '0 0 10px 4px rgba(255, 255, 255, 0.8)' : '0 2px 8px rgba(0, 0, 0, 0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        font-weight: bold;
        font-size: ${size > 20 ? '12px' : '10px'};
      ">
        ${uuvID.replace('uuv', '')}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <Marker
      position={[lat, lng]}
      icon={createCustomIcon(color, isSelected)}
    >
      <Popup>
        <div>
          <strong>UUV: {uuvID}</strong><br />
          Original Position: ({position.x.toFixed(2)}, {position.y.toFixed(2)})<br />
          Map Position: ({lat.toFixed(6)}, {lng.toFixed(6)})
          {isSelected && (
            <>
              <br />
              <em>Selected</em>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
