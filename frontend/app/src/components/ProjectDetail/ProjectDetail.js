import React, { useState } from 'react';
// import { MapContainer, TileLayer } from 'react-leaflet';  

const dummyDates = ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01'];

const ProjectDetail = ({ project }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownloadClick = () => {
    alert('Image download button clicked');
  };

  return (
    <div>
      <h2>{project.name} - Details</h2>
      
      {/* Date Picker For Image */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label htmlFor="date-dropdown" style={{ marginRight: '10px', fontSize: '1.2rem' }}>
          Select a Date:
        </label>
        <select
          id="date-dropdown"
          value={startDate} // Assuming `startDate` state is already defined
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        >
          <option value="" disabled>
            Choose a date
          </option>
          {['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01'].map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
        {startDate && <p style={{ marginTop: '10px' }}>Selected Date: {startDate}</p>}
      </div>

      {/* Image Div */}
      <div
        style={{
          height: '400px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h4
          style={{
            fontSize: '2rem',
            fontWeight: '300',
            marginBottom: '1rem',
          }}
        >
          What date ranges are you interested in?
        </h4>
        <button
          onClick={() => setShowPopup(true)}
          style={{
            backgroundColor: '#4285F4',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          + Select Date Range
        </button>

        {showPopup && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#FFFFFF',
              padding: '3rem',
              width: '60%',
              minHeight: '40vh',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <button
                onClick={() => setShowPopup(false)} // Close the popup on click
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#888', // Light gray color for the X
                }}
              >
                &times; {/* HTML entity for "X" */}
            </button>
            <h4
              style={{
                fontSize: '1.8rem',
                marginBottom: '2rem',
                fontWeight: '300',
              }}
            >
              Select Date Range
            </h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  display: 'block',
                  margin: '0 auto',
                  padding: '0.8rem',
                  fontSize: '1rem',
                  width: '80%',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  display: 'block',
                  margin: '0 auto',
                  padding: '0.8rem',
                  fontSize: '1rem',
                  width: '80%',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
            </div>
            <button
              onClick={handleDownloadClick}
              style={{
                backgroundColor: '#4285F4',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '1rem',
                width: '50%',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              Download Images
            </button>
          </div>
        )}
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

// /////////


// const ProjectDetail = ({ project }) => {
//   return (
//     <div style={{ 
//       display: 'flex', 
//       flexDirection: 'column', // Stack elements vertically
//       justifyContent: 'center', 
//       alignItems: 'center', 
//       height: '70vh', 
//       textAlign: 'center' 
//     }}>
//       <h4 style={{ 
//         fontSize: '2rem', 
//         fontWeight: '300', 
//         marginBottom: '1rem' // Add spacing between text and button
//       }}>
//         What date ranges are you interested in?
//       </h4>
//       <button style={{
//         backgroundColor: '#4285F4', // Blue color similar to your image
//         color: '#FFFFFF', // White text
//         border: 'none',
//         borderRadius: '8px', // Rounded corners
//         padding: '12px 24px', // Padding for size
//         fontSize: '1rem',
//         cursor: 'pointer',
//         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow
//       }}>
//         Select Date Range
//       </button>
//     </div>
//   );
// };

export default ProjectDetail;

