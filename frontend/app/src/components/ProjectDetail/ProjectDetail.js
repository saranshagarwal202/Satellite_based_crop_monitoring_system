import React, { useState } from 'react';
import NDVI_on_AOI from '../../assets/NDVI_on_AOI.jpeg';
import AOI from '../../assets/AOI_Full.jpeg';
import NDVI_All_Time from '../../assets/NDVI_All_Time.jpeg';

const ProjectDetail = ({ project }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('not_requested');
  const [selectedDate, setSelectedDate] = useState('');
  const dates = ['2020-07-16', '2024-02-01', '2024-03-01']; // Dummy dates


  const handleDownloadClick = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates before downloading.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be earlier than or equal to the end date.');
      return;
    }

    setDownloadStatus('in_progress');
    setTimeout(() => {
      setDownloadStatus('completed');
    }, 3000);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>{project.name} - Details</h2>

      {downloadStatus === 'not_requested' && (
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Select a Date Range</h4>
          <button
            onClick={() => setShowPopup(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4285F4',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Select Date Range
          </button>
        </div>
      )}

      {downloadStatus === 'in_progress' && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p>Downloading images... Please wait.</p>
        </div>
      )}

      {downloadStatus === 'completed' && (
        <>
          {/* Two-pane Layout */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            {/* Left Pane */}
            <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
              <label htmlFor="date-dropdown" style={{ display: 'block', marginBottom: '10px' }}>
                Select a Date:
              </label>
              <select
                id="date-dropdown"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '10px',
                  width: '100%',
                  marginBottom: '20px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="" disabled>
                  Choose a date
                </option>
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>

              {selectedDate && (
                // <div
                //   style={{
                //     height: '200px',
                //     backgroundColor: 'red',
                //     display: 'flex',
                //     justifyContent: 'center',
                //     alignItems: 'center',
                //     color: 'white',
                //     borderRadius: '8px',
                //   }}
                // >
                //   Selected Image for {selectedDate}
                // </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={AOI}
                    alt="Area of Interest"
                    style={{
                      height: 'auto',
                      width: '500px', // Keeps the image's aspect ratio
                      marginBottom: '10px',
                      // borderRadius: '8px',
                      borderRadius: '0px',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Pane */}
            <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ textAlign: 'center' }}>
                Field Image Analytics for Date {selectedDate || 'Not Selected'}
              </h4>
              {selectedDate && (
                <div>
                  {/* <div
                    style={{
                      height: '150px',
                      backgroundColor: 'blue',
                      marginBottom: '10px',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '8px',
                    }}
                  >
                    Plot 1
                  </div> */}
                  <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  >
                    <img
                    src={NDVI_on_AOI}
                    alt="NDVI on AOI"
                    style={{
                      height: 'auto',
                      width: '500px', // Keeps the image's aspect ratio
                      marginBottom: '10px',
                      // borderRadius: '8px',
                      borderRadius: '0px',
                    }}
                  />
                  </div>
                  {/* <div
                    style={{
                      height: '150px',
                      backgroundColor: 'green',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '8px',
                    }}
                  >
                    Plot 2
                  </div> */}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>AOI Analytics Across Time</h3>
            {/* <div
              style={{
                height: '200px',
                backgroundColor: 'purple',
                marginBottom: '20px',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
              }}
            >
              AOI Plot 1
            </div> */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                    src={NDVI_All_Time}
                    alt="NDVI Across Time"
                    style={{
                      height: '450px',
                      width: 'auto', // Keeps the image's aspect ratio
                      marginBottom: '10px',
                      // borderRadius: '8px',
                      borderRadius: '0px',
                    }}
                  />
            </div>
            {/* <div
              style={{
                height: '200px',
                backgroundColor: 'orange',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
              }}
            >
              AOI Plot 2
            </div> */}
          </div>
        </>
      )}

      {/* Popup for Date Range Selection */}
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h4>Select Date Range</h4>
          <label>
            From:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                display: 'block',
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
          </label>
          <label>
            To:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                display: 'block',
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
          </label>
          <button
            onClick={() => {
              handleDownloadClick();
              setShowPopup(false);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4285F4',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Download
          </button>
          <button
            onClick={() => setShowPopup(false)}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              backgroundColor: '#ccc',
              color: '#000',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
