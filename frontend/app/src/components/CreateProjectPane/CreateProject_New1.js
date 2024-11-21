import React, { useState } from 'react';
import { TextField, Button, Box, Typography, LinearProgress } from '@mui/material';
import PolygonMarker from '../PolygonMarker/PolygonMarker.js';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './CreateProject.css'; // Import CSS for transitions and additional styling

const CreateProject = () => {
  const [step, setStep] = useState(1); // Track current step
  const [farmName, setFarmName] = useState('');
  const [crop, setCrop] = useState('');
  const [seedingDate, setSeedingDate] = useState('');
  const [aoi, setAoi] = useState(null); // AOI GeoJSON

  const handleAoiSubmit = (geoJson) => {
    setAoi(geoJson);
    setStep(step + 1); // Go to the next step
  };

  const handleSubmit = () => {
    if (!farmName || !crop || !seedingDate || !aoi) {
      alert('Please fill out all fields and select an AOI.');
      return;
    }

    const projectData = {
      farm_name: farmName,
      crop,
      seeding_date: seedingDate,
      aoi: aoi.features[0].geometry.coordinates, // Extract AOI coordinates
      created_at: new Date().toISOString(),
    };

    console.log('Submitting Project Data:', projectData);
    alert('Project Created Successfully!');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <TextField
            fullWidth
            label="Farm Name"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            autoFocus
          />
        );
      case 2:
        return (
          <TextField
            fullWidth
            label="Crop"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          />
        );
      case 3:
        return (
          <TextField
            fullWidth
            type="date"
            label="Seeding Date"
            InputLabelProps={{ shrink: true }}
            value={seedingDate}
            onChange={(e) => setSeedingDate(e.target.value)}
          />
        );
      case 4:
        return (
          <Box
            sx={{
              height: '400px',
              border: '1px solid #ccc',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <PolygonMarker onAoiSubmit={handleAoiSubmit} />
          </Box>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review Your Project
            </Typography>
            <Typography>Farm Name: {farmName}</Typography>
            <Typography>Crop: {crop}</Typography>
            <Typography>Seeding Date: {seedingDate}</Typography>
            <Typography>AOI Coordinates: {JSON.stringify(aoi.features[0].geometry.coordinates)}</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        px: 2,
        py: 4,
      }}
    >
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Create New Project
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: '#666', textAlign: 'center', maxWidth: '600px' }}>
        Follow the steps to create your project. Provide details about your farm, crop, seeding date, and mark the area
        of interest (AOI) on the map.
      </Typography>

      <Box
        sx={{
          p: 4,
          maxWidth: '600px',
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: 4,
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Progress Bar */}
        <LinearProgress variant="determinate" value={(step / 5) * 100} sx={{ width: '100%', mb: 3 }} />

        {/* Transition for Step Content */}
        <SwitchTransition>
          <CSSTransition
            key={step} // Re-render when step changes
            classNames="step-transition"
            timeout={300}
          >
            <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>{renderStepContent()}</Box>
          </CSSTransition>
        </SwitchTransition>

        {/* Navigation Buttons */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: step > 1 ? 'space-between' : 'flex-end',
            width: '100%',
          }}
        >
          {step > 1 && (
            <Button variant="outlined" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 5 && (
            <Button
              variant="contained"
              onClick={() => setStep(step + 1)}
              disabled={step === 4 && !aoi} // Disable "Next" if AOI is not selected
            >
              Next
            </Button>
          )}
          {step === 5 && (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateProject;
