import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import DownloadIcon from '@mui/icons-material/Download';
import { Fab, Tooltip } from '@mui/material';

function PolygonMarker() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const mapRef = useRef();

  const onCreated = (e) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    setGeoJsonData(geoJson);
    console.log('GeoJSON:', geoJson);
  };

  const downloadGeoJSON = () => {
    if (!geoJsonData) {
      alert("No GeoJSON data available!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJsonData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'polygon.geojson');
    downloadAnchor.click();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>  
      <div style={{
        backgroundColor: 'black', 
        color: 'white', 
        fontSize: '20px',
        fontWeight: 'bold', 
        padding: '10px 20px',
        display: 'flex', 
        alignItems: 'center',
        flexShrink: 0,  
        height: '50px',  
        boxSizing: 'border-box'  
      }}>
        Cotton Yield Prediction - AOI Marker
      </div>
      
      {/* Map Container */}
      <div style={{ flexGrow: 1 }}>  
        <MapContainer
          center={[30.62798, -96.33441]}  
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}  
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: false,
                circle: true,
                circlemarker: false,
                polyline: false,
                marker: false
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      <Tooltip title="Download GeoJSON" arrow>
        <Fab
          color="primary"
          aria-label="download"
          onClick={downloadGeoJSON}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '80px',
            height: '80px',
          }}
        >
          <DownloadIcon style={{ fontSize: 40 }} />
        </Fab>
      </Tooltip>
    </div>
  );
}

export default PolygonMarker;
