import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Button } from '@mui/material';

function PolygonMarker({ onAoiSubmit }) {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isEditable, setIsEditable] = useState(true); // Track edit state
  const mapRef = useRef();

  const onCreated = (e) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    setGeoJsonData(geoJson);
    console.log('GeoJSON:', geoJson);
  };

  const freezePolygon = () => {
    if (geoJsonData) {
      setIsEditable(false); // Disable editing
      if (onAoiSubmit) {
        onAoiSubmit(geoJsonData); // Send finalized GeoJSON to parent
      }
    } else {
      alert('Please draw a polygon before freezing.');
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[30.62798, -96.33441]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={onCreated}
            edit={{ edit: isEditable, remove: isEditable }}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: false,
              marker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>

      {/* Freeze Polygon Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={freezePolygon}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
        }}
      >
        Freeze Polygon
      </Button>
    </div>
  );
}

export default PolygonMarker;
