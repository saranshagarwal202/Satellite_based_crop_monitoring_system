import React from 'react';

const DatePickerPopup = ({ startDate, endDate, setStartDate, setEndDate, onClose, onDownload }) => (
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
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#888',
      }}
    >
      &times;
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
      onClick={() => {
        onDownload();
        onClose();
      }}
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
);

export default DatePickerPopup;
