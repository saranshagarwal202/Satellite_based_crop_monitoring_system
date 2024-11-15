import React, { useState } from 'react';
import { Button, Box, Typography, Slider, Fade } from '@mui/material';

const TopBar = ({ selectedDate, onDateChange }) => {
  const [isSliderVisible, setSliderVisible] = useState(false);

  const handleDateClick = () => {
    setSliderVisible(!isSliderVisible);
  };

  const handleSliderChange = (event, newValue) => {
    onDateChange(newValue);
  };

  return (
    <Box sx={{ position: 'relative', backgroundColor: '#f7f8fa', padding: '10px 0' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'SF Pro Text, Helvetica Neue, Arial, sans-serif',
            fontSize: '16px',
            color: '#007AFF',
            cursor: 'pointer', 
            fontWeight: '500',
          }}
          onClick={handleDateClick}  
        >
          Today
          <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>{selectedDate}</span>
        </Typography>

        {['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5', 'Metric 6'].map(
          (label) => (
            <Button
              key={label}
              variant="outlined"
              sx={{
                fontSize: '14px',
                fontWeight: '500',
                padding: '5px 15px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                color: '#333',
                backgroundColor: '#f5f5f7',
                '&:hover': {
                  backgroundColor: '#e1e2e6',
                },
                transition: 'background-color 0.3s ease',
              }}
            >
              {label}
            </Button>
          )
        )}
      </Box>

      <Fade in={isSliderVisible}>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            padding: '20px',
            backgroundColor: '#fff',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Slider
            value={selectedDate}
            onChange={handleSliderChange}
            min={1}
            max={31}
            sx={{
              width: '80%',
              color: '#007AFF',  
              '& .MuiSlider-thumb': {
                height: 24,
                width: 24,
                backgroundColor: '#fff',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)', 
              },
              '& .MuiSlider-track': {
                height: 4,
                borderRadius: 2,
              },
              '& .MuiSlider-rail': {
                height: 4,
                borderRadius: 2,
                backgroundColor: '#e0e0e0',
              },
            }}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default TopBar;
