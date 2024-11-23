import React, { useState } from 'react';
import { Typography, Button, Box, TextField, Menu, MenuItem } from '@mui/material';

const ProjectDetail = () => {
  const [selectedButton, setSelectedButton] = useState('Satellite Image');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2024-11-20'); // Default date
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for dropdown
  const availableDates = ['2024-11-20', '2024-11-15', '2024-11-10']; // Dropdown values

  // Mock project details
  const project = {
    name: 'Farm Alpha',
    seedingDate: '2024-11-20',
  };

  // Handle downloading images
  const handleDownloadImages = () => {
    if (!startDate || !endDate) {
      alert('Please select both Start Date and End Date.');
      return;
    }
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false); // Simulate download completion
    }, 3000);
  };

  // Render content based on the selected button
  const renderContent = () => {
    switch (selectedButton) {
      case 'Satellite Image':
        return <Box sx={{ height: '300px', backgroundColor: '#e0e0e0', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>Satellite Image View</Box>;
      case 'NDVI Heat Map':
        return <Box sx={{ height: '300px', backgroundColor: '#FFCDD2', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>NDVI Heat Map</Box>;
      case 'GCI Heat Map':
        return <Box sx={{ height: '300px', backgroundColor: '#C8E6C9', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>GCI Heat Map</Box>;
      case 'NDVI Plot':
        return <Box sx={{ height: '300px', backgroundColor: '#BBDEFB', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>NDVI Plot</Box>;
      case 'GCI Plot':
        return <Box sx={{ height: '300px', backgroundColor: '#D1C4E9', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>GCI Plot</Box>;
      case 'Yield Estimate':
        return <Box sx={{ height: '300px', backgroundColor: '#FFE0B2', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>Yield Estimate</Box>;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Bar with Start/End Date and Download Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      >
        <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
        </Box>
        <Button
          onClick={handleDownloadImages}
          sx={{
            textTransform: 'none',
            color: 'white',
            fontWeight: 'bold',
            backgroundColor: '#007AFF',
            padding: '10px 30px',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#005BBB',
            },
          }}
        >
          Download New Images
        </Button>
      </Box>

      {/* Show "Downloading..." Message */}
      {isDownloading ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f2f2f2',
            borderRadius: '10px',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          Downloading satellite images from Planet...
        </Box>
      ) : (
        <>
          {/* Clickable Date Dropdown */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px',
            }}
          >
            <Typography
              variant="h6"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                fontWeight: 'bold',
                color: '#007AFF',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {selectedDate}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              sx={{
                mt: 1,
                '& .MuiPaper-root': {
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              {availableDates.map((date) => (
                <MenuItem
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setAnchorEl(null);
                  }}
                  sx={{
                    fontWeight: selectedDate === date ? 'bold' : 'normal',
                    color: selectedDate === date ? '#007AFF' : '#333',
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                    },
                  }}
                >
                  {date}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: 'flex', gap: '10px' }}>
              {['Satellite Image', 'NDVI Heat Map', 'GCI Heat Map', 'NDVI Plot', 'GCI Plot', 'Yield Estimate'].map(
                (label) => (
                  <Button
                    key={label}
                    onClick={() => setSelectedButton(label)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: selectedButton === label ? 'bold' : 'normal',
                      color: selectedButton === label ? 'white' : '#007AFF',
                      backgroundColor: selectedButton === label ? '#007AFF' : 'transparent',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: selectedButton === label ? '#005BBB' : '#f2f2f2',
                      },
                    }}
                  >
                    {label}
                  </Button>
                )
              )}
            </Box>
          </Box>

          {/* Details Pane */}
          <Box sx={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
            {/* Top Section */}
            <Box sx={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f2f2f2', borderRadius: '10px' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                Farm Name: {project.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Seeding Date: {project.seedingDate}
              </Typography>
            </Box>

            {/* Content Section */}
            <Box sx={{ marginBottom: '20px' }}>{renderContent()}</Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProjectDetail;
