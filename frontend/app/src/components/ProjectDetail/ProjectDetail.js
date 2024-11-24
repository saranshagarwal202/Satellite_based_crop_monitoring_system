import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, TextField, Menu, MenuItem } from '@mui/material';
import { downloadImagesForProject, getImageForProject, getImageDownloadStatus, getUserProjects, getImageByTypeAndDate } from '../../services/projectservice';

const ProjectDetail = ({ projectData, userId, authorization, planetKey}) => {
  const [selectedButton, setSelectedButton] = useState('Satellite Image');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRunning, setIsRunning] = useState(false); // Status indicator for download
  const [selectedDate, setSelectedDate] = useState(''); // Default date
  const [availableDates, setAvailableDates] = useState([]); // Dates for dropdown
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for dropdown
  const [fetchedImage, setFetchedImage] = useState(null); // Fetched image data

  const [isImageLoading, setIsImageLoading] = useState(false); // New state to track loading

  // Mock project details for display
  const project = projectData || {
    _id: 'project-id', // Example fallback project ID
    name: 'Farm Alpha',
    seedingDate: '2024-11-20',
    images: ['20241120_image_1', '20241115_image_2', '20241110_image_3'],
  };

  // Map image names to dates
  useEffect(() => {
    const dates = project.images.map((imageName) => {
      const datePart = imageName.split('_')[0]; // Extract the date (yyyymmdd)
      return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`; // Format: yyyy-mm-dd
    });
    setAvailableDates([...new Set(dates)]); // Remove duplicates
    setSelectedDate(dates[0] || ''); // Set first date as default
  }, [project.images]);

  useEffect(() => {
    // Fetch the first satellite image if available and no image is loaded yet
    if (project.images.length > 0 && !fetchedImage) {
      const firstDate = project.images[0].split('_')[0];
      const formattedDate = `${firstDate.slice(0, 4)}-${firstDate.slice(4, 6)}-${firstDate.slice(6, 8)}`;
      setSelectedDate(formattedDate); // Set the first date as the default selected date
      fetchImageForTypeAndDate('sat'); // Fetch the first satellite image by default
    }
  }, [project.images, fetchedImage]);
  
    const refreshProjectData = async () => {
        try {
        const result = await getUserProjects(authorization, userId); // Assuming this API refreshes project data
        if (result.status === 'success') {
            const updatedProject = result.data.find((p) => p.id === project.id); // Find the current project
            if (updatedProject) {
            setAvailableDates(updatedProject.images.map((imageName) => {
                const datePart = imageName.split('_')[0];
                return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
            }));
            if (!selectedDate && updatedProject.images.length > 0) {
                setSelectedDate(`${updatedProject.images[0].split('_')[0]}`); // Set default date
            }
            }
        }
        } catch (error) {
        console.error('Error refreshing project data:', error);
        }
    };

    const handleRefresh = async () => {
        try {
          // Call the refreshProjectData function to fetch updated project data
          await refreshProjectData();
      
          // Optionally, you can reset the fetched image to ensure the first satellite image is loaded again
          if (project.images.length > 0) {
            const firstDate = project.images[0].split('_')[0];
            const formattedDate = `${firstDate.slice(0, 4)}-${firstDate.slice(4, 6)}-${firstDate.slice(6, 8)}`;
            setSelectedDate(formattedDate);
            fetchImageForTypeAndDate('sat'); // Load the first satellite image again
          }
        } catch (error) {
          console.error('Error refreshing project data:', error);
          alert('An error occurred while refreshing the project data. Please try again.');
        }
      };

    const fetchImageForTypeAndDate = async (imageType) => {
        if (!selectedDate) {
          alert('Please select a valid date.');
          return;
        }
      
        try {
          setIsImageLoading(true); // Show loading indicator
      
          // Make the API call for the selected image type
          const result = await getImageByTypeAndDate(
            authorization,
            userId,
            project.id, // Always pass project ID
            imageType,  // The selected button's image type (e.g., sat, ndvi)
            selectedDate // The selected date
          );
      
          if (result.status === 'success') {
            const imageBlob = result.data; // Get the image blob
            const imageURL = URL.createObjectURL(imageBlob); // Convert to URL
            setFetchedImage(imageURL); // Set the fetched image
          } else {
            alert(`Failed to fetch image: ${result.message}`);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
          alert('An error occurred while fetching the image.');
        } finally {
          setIsImageLoading(false); // Hide loading indicator
        }
      };

const pollDownloadStatus = async (authorization, userId, projectId, maxAttempts, pollInterval) => {
    let attempts = 0;
  
    const poll = async (resolve, reject) => {
      attempts++;
      try {
        const statusResult = await getImageDownloadStatus(authorization, userId, projectId);
  
        if (statusResult.status === 'success') {
          if (statusResult.data.status === 'finished') {
            await refreshProjectData(); // Refresh project data
            resolve('Download process completed.');
          } else if (attempts < maxAttempts) {
            setTimeout(() => poll(resolve, reject), pollInterval);
          } else {
            reject('Polling timed out after 30 minutes. Please check again later.');
          }
        } else {
          reject(`Error checking status: ${statusResult.message}`);
        }
      } catch (error) {
        reject(`Error during polling: ${error.message}`);
      }
    };
  
    return new Promise(poll);
  };  
  
const handleDownloadImages = async () => {
    if (!startDate || !endDate) {
      alert('Please select both Start Date and End Date.');
      return;
    }
  
    setIsRunning(true); // Show the running state immediately
  
    try {
      const dateRange = { start_date: startDate, end_date: endDate };
      const result = await downloadImagesForProject(
        authorization,
        userId,
        project.id,
        dateRange,
        project.aoi,
        planetKey
      );
  
      if (result.status === 'success') {
        alert(result.message);
  
        // Start polling for status
        const pollInterval = 30000; // Poll every 30 seconds
        const maxAttempts = 60; // Stop after 60 attempts (30 minutes)
  
        try {
          const statusMessage = await pollDownloadStatus(authorization, userId, project.id, maxAttempts, pollInterval);
          alert(statusMessage);
          setIsRunning(false);
          // Reload or update project data here if necessary
        } catch (error) {
          alert(error);
          setIsRunning(false);
        }
      } else {
        alert(result.message);
        setIsRunning(false); // If error occurs, allow interaction again
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
      setIsRunning(false); // If error occurs, allow interaction again
    }
  };

  const renderContent = () => {
    if (isImageLoading) {
      return (
        <Box
          sx={{
            height: '300px',
            backgroundColor: '#f2f2f2',
            textAlign: 'center',
            lineHeight: '300px',
            borderRadius: '10px',
            fontSize: '18px',
            color: '#666',
          }}
        >
          Loading...
        </Box>
      );
    }
  
    if (fetchedImage) {
      return (
        <Box
          sx={{
            height: '300px',
            padding: '10px 20px', // Padding around the image
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={fetchedImage}
            alt="Fetched"
            style={{
              maxWidth: '90%',
              maxHeight: '80%',
              objectFit: 'contain', // Maintain aspect ratio
              borderRadius: '8px', // Rounded corners for the image
            }}
          />
        </Box>
      );
    }
  
    return (
      <Box
        sx={{
          height: '300px',
          backgroundColor: '#e0e0e0',
          textAlign: 'center',
          lineHeight: '300px',
          borderRadius: '10px',
          color: '#666',
        }}
      >
        No Image Available
      </Box>
    );
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
    disabled={isRunning} // Disable while running
    sx={{ width: '200px' }}
  />
  <TextField
    label="End Date"
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    disabled={isRunning} // Disable while running
    sx={{ width: '200px' }}
  />
</Box>
<Box sx={{ textAlign: 'center', flex: 1, marginLeft: '20px', fontWeight: 'bold', color: '#666' }}>
  {isRunning ? 'Status: Running...' : ''}
</Box>
<Button
  onClick={handleDownloadImages}
  disabled={isRunning} // Disable button while running
  sx={{
    textTransform: 'none',
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: isRunning ? '#B0BEC5' : '#007AFF', // Change color if disabled
    padding: '10px 30px',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: isRunning ? '#B0BEC5' : '#005BBB',
    },
  }}
>
  Download New Images
</Button>

      </Box>

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
    onClick={(e) => availableDates.length > 0 && setAnchorEl(e.currentTarget)}
    sx={{
      fontWeight: 'bold',
      color: availableDates.length > 0 ? '#007AFF' : '#999',
      cursor: availableDates.length > 0 ? 'pointer' : 'not-allowed',
      '&:hover': availableDates.length > 0 ? { textDecoration: 'underline' } : {},
    }}
  >
    {availableDates.length > 0 ? selectedDate || 'Select a date' : 'No dates available'}
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
    {['sat', 'sat_ndvi', 'sat_gci', 'ndvi', 'gci', 'yield'].map((label, index) => (
      <Button
        key={label}
        onClick={() => fetchImageForTypeAndDate(label)}
        disabled={availableDates.length === 0} // Disable buttons if no dates
        sx={{
          textTransform: 'none',
          fontWeight: selectedButton === label ? 'bold' : 'normal',
          color: selectedButton === label ? 'white' : availableDates.length > 0 ? '#007AFF' : '#999',
          backgroundColor: selectedButton === label ? '#007AFF' : 'transparent',
          padding: '10px 20px',
          borderRadius: '8px',
          '&:hover': availableDates.length > 0
            ? { backgroundColor: selectedButton === label ? '#005BBB' : '#f2f2f2' }
            : {},
        }}
      >
        {['Satellite Image', 'NDVI Heat Map', 'GCI Heat Map', 'NDVI Plot', 'GCI Plot', 'Yield Estimate'][index]}
      </Button>
    ))}
  </Box>
</Box>


      {/* Details Pane */}
<Box
  sx={{
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  }}
>
  {/* Top Section */}
  <Box
    sx={{
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f2f2f2',
      borderRadius: '10px',
      display: 'flex', // Add flex for layout
      justifyContent: 'space-between', // Space between text and button
      alignItems: 'center', // Align items vertically
    }}
  >
    <Box>
      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
        Farm Name: {project.name}
      </Typography>
      <Typography variant="body2" sx={{ color: '#666' }}>
        Seeding Date: {project.seedingDate}
      </Typography>
    </Box>
    <Button
      variant="contained"
      color="primary"
      onClick={handleRefresh} // Add refresh logic here
      sx={{
        textTransform: 'none',
        padding: '5px 15px',
        borderRadius: '5px',
        fontSize: '14px',
      }}
    >
      Refresh
    </Button>
  </Box>

  {/* Content Section */}
  <Box sx={{ marginBottom: '20px' }}>{renderContent()}</Box>
</Box>

    </Box>
  );
};

export default ProjectDetail;
