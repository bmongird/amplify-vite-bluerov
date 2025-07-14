import React, { RefObject } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface BackgroundMapProps {
  backgroundImage?: string;
  containerRef: RefObject<HTMLDivElement>;
  children: React.ReactNode;
  mapChildren?: React.ReactNode;
  mapCenter?: [number, number];
}

export const BackgroundMap: React.FC<BackgroundMapProps> = ({ 
  containerRef, 
  children, 
  mapChildren, 
  mapCenter 
}) => {
  const mapRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter, mapRef.current.getZoom());
    }
  }, [mapCenter]);

  // San Francisco Bay
  // center is only defined because the uuvs transmit position in meter's from the initial position in the sim
  // in a real world application the uuvs would likely transmit lat/long making this part obsolete
  const center: [number, number] = mapCenter || [37.8120, -122.4058];
  const zoom = 15;

  return (
    <div 
      ref={containerRef}
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        zIndex: 0
      }}
    >
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ 
          height: '100vh', 
          width: '100vw',
          zIndex: 0
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS"
          zIndex={0}
        />

        <WMSTileLayer
          url="https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/WMSServer"
          layers="3,5,6" // can add 2 for depth
          format="image/png"
          transparent={true}
          attribution='NOAA Chart Display'
          zIndex={1}
        />

        <WMSTileLayer
          url="https://depth.openseamap.org/geoserver/openseamap/wms"
          layers="openseamap:contour2,openseamap:contour"
          format="image/png"
          transparent={true}
          attribution="OpenSeaMap Depth Data"
        />

        {mapChildren}
      </MapContainer>
      
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 10,
        pointerEvents: 'none' 
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
