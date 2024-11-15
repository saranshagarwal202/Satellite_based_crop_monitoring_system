import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';  

const ProjectDetail = ({ project }) => {
  return (
    <div>
      <h2>{project.name} - Details</h2>

      <h4>Area of Interest - Will be highlighted | Currently just a map</h4>

      <div style={{ height: '400px', marginBottom: '20px' }}>
        <MapContainer
          center={[30.62798, -96.33441]} 
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h3>Detail - X:</h3>
      </div>

      {/* More Details */}
      <table style={{ width: '100%', marginTop: '20px', border: '1px solid #ccc' }}>
        <thead>
          <tr>
            <th>Details</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Detail X 1</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Detail X 2</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProjectDetail;
