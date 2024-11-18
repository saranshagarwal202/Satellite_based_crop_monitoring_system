// import React, { useState } from 'react';

// const ProjectDetail = () => {
//     const [showPopup, setShowPopup] = useState(false);
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
  
//     const handleDownloadClick = () => {
//       alert('button clicked');
//     };
  
//     return (
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '70vh',
//           textAlign: 'center',
//         }}
//       >
//         <h4
//           style={{
//             fontSize: '2rem',
//             fontWeight: '300',
//             marginBottom: '1rem',
//           }}
//         >
//           What date ranges are you interested in?
//         </h4>
//         <button
//           onClick={() => setShowPopup(true)}
//           style={{
//             backgroundColor: '#4285F4',
//             color: '#FFFFFF',
//             border: 'none',
//             borderRadius: '8px',
//             padding: '12px 24px',
//             fontSize: '1rem',
//             cursor: 'pointer',
//             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
//           }}
//         >
//           + Select Date Range
//         </button>
  
//         {showPopup && (
//           <div
//             style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               backgroundColor: '#FFFFFF',
//               padding: '3rem', // More padding for spaciousness
//               width: '50vw', // 50% of the viewport width
//               minHeight: '40vh', // Minimum height for spacing
//               boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow for emphasis
//               borderRadius: '16px', // More rounded corners
//               textAlign: 'center',
//             }}
//           >
//             <h4
//               style={{
//                 fontSize: '1.8rem',
//                 marginBottom: '2rem',
//                 fontWeight: '300',
//               }}
//             >
//               Select Date Range
//             </h4>
//             <div style={{ marginBottom: '1.5rem' }}>
//               <label style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>Start Date:</label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 style={{
//                   display: 'block',
//                   margin: '0 auto',
//                   padding: '0.8rem',
//                   fontSize: '1rem',
//                   width: '80%',
//                   border: '1px solid #ccc',
//                   borderRadius: '8px',
//                 }}
//               />
//             </div>
//             <div style={{ marginBottom: '1.5rem' }}>
//               <label style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>End Date:</label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 style={{
//                   display: 'block',
//                   margin: '0 auto',
//                   padding: '0.8rem',
//                   fontSize: '1rem',
//                   width: '80%',
//                   border: '1px solid #ccc',
//                   borderRadius: '8px',
//                 }}
//               />
//             </div>
//             <button
//               onClick={handleDownloadClick}
//               style={{
//                 backgroundColor: '#4285F4',
//                 color: '#FFFFFF',
//                 border: 'none',
//                 borderRadius: '8px',
//                 padding: '12px 24px',
//                 fontSize: '1rem',
//                 cursor: 'pointer',
//                 marginTop: '1rem',
//                 width: '50%',
//                 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
//               }}
//             >
//               Download Images
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   };
  
//   export default ProjectDetail;
  

import React, { useState } from 'react';

const ProjectDetail = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownloadClick = () => {
    alert('button clicked');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        textAlign: 'center',
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
            left: '55%', // Center in the right 70%
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#FFFFFF',
            padding: '3rem',
            width: '60%', // Limit popup width
            minHeight: '40vh',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
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
  );
};

export default ProjectDetail;
