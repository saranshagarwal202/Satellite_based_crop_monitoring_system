import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Button } from '@mui/material';
import L from 'leaflet';

function PolygonMarker({ onAoiSubmit }) {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isEditable, setIsEditable] = useState(true); 
  const mapRef = useRef();

  const featureGroupRef = useRef();

 

  // const onCreated = (e) => {
  //   if (e.layer) {
  //     const featureGroup = featureGroupRef.current;
  //     if (featureGroup) {
  //       featureGroup.clearLayers(); // Clear all existing layers
  //     }
  
  //     const layer = e.layer;
  //     const geoJson = layer.toGeoJSON();
  //     alert(geoJson);
  //     // setGeoJsonData(geoJson); // Update state
  //     alert(JSON.stringify(geoJson, null, 2));
  //     featureGroup.addLayer(layer); // Add the new layer to the group
  
  //     console.log('FeatureGroupRef:', featureGroupRef.current); // Debug the feature group
  //     console.log('GeoJSON Data:', geoJson); // Debug the updated GeoJSON data
  //   } else {
  //     console.warn('No layer created.');
  //     alert('No layer created.');
  //   }
  // };

  const onCreated = (e) => {
    if (e.layer) {
      const layer = e.layer;
      const geoJson = layer.toGeoJSON();
  
      // Update state with GeoJSON data
      setGeoJsonData(geoJson);
  
      // Enable the freeze button
      console.log('GeoJSON Data:', geoJson);
      alert(JSON.stringify(geoJson, null, 2)); // Optional debug
    } else {
      console.warn('No layer created.');
    }
  };
  
  
  const freezePolygon = () => {
    console.log('GeoJSON Data at Freeze:', geoJsonData); // Log geoJsonData before validation
    if (geoJsonData && geoJsonData.geometry && geoJsonData.geometry.coordinates.length > 0) {
      setIsEditable(false);
      if (onAoiSubmit) {
        console.log("$$ AOI SUBMIT CLICKED", geoJsonData);
        onAoiSubmit(geoJsonData);
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
        <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={onCreated}
          edit={{ edit: isEditable, remove: isEditable }}
          draw={isEditable ? { rectangle: false, circle: false, circlemarker: false, polyline: false, marker: false } : false}
        />
      </FeatureGroup>

      </MapContainer>
      <Button
        variant="contained"
        color="primary"
        onClick={freezePolygon}
        disabled={!geoJsonData || !geoJsonData.geometry || !geoJsonData.geometry.coordinates.length}
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
