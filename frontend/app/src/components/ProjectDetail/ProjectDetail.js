import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, TextField, Menu, MenuItem } from '@mui/material';
import { downloadImagesForProject, getImageForProject } from '../../services/projectservice';

const ProjectDetail = ({ projectData, userId, authorization }) => {
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
    if (projectData) {
      alert(`$$$$$ Project Data: ${JSON.stringify(projectData, null, 2)}`);
    }
  }, [projectData]);

  useEffect(() => {
    alert(`Authorization: ${authorization}, User ID: ${userId}, Project ID: ${projectData?.id}`);
  }, [authorization, userId, projectData]);

  // Handle fetching images for specific image type and date
//   const fetchImageForTypeAndDate = async (imageType) => {
//     if (!selectedDate) {
//       alert('Please select a valid date.');
//       return;
//     }

//     try {
//       const imageRequest = {
//         date_of_interest: selectedDate,
//       };
//       const result = await getImageForProject(authorization, userId, project._id, imageRequest);

//       if (result.status === 'success') {
//         const imageBlob = result.data;
//         const imageURL = URL.createObjectURL(imageBlob);
//         setFetchedImage(imageURL); // Update the fetched image
//       } else {
//         alert(`Failed to fetch image: ${result.message}`);
//       }
//     } catch (error) {
//       console.error('Error fetching image:', error);
//       alert('An error occurred while fetching the image.');
//     }
//   };

    const fetchImageForTypeAndDate = async (imageType) => {
        if (!selectedDate) {
        alert('Please select a valid date.');
        return;
        }
    
        try {
        setIsImageLoading(true); // Set loading to true
        const imageRequest = {
            date_of_interest: selectedDate,
        };
        const result = await getImageForProject(authorization, userId, project.id, imageRequest);
    
        if (result.status === 'success') {
            const imageBlob = result.data;
            const imageURL = URL.createObjectURL(imageBlob);
            setFetchedImage(imageURL); // Update the fetched image
        } else {
            alert(`Failed to fetch image: ${result.message}`);
        }
        } catch (error) {
        console.error('Error fetching image:', error);
        alert('An error occurred while fetching the image.');
        } finally {
        setIsImageLoading(false); // Set loading to false
        }
    };

  // Handle downloading images
//   const handleDownloadImages = () => {
//     if (!startDate || !endDate) {
//       alert('Please select both Start Date and End Date.');
//       return;
//     }
    
//     setIsRunning(true);
//     setTimeout(() => {
//       setIsRunning(false); // Simulate completion
//     }, 3000);
//   };
const handleDownloadImages = async () => {
    if (!startDate || !endDate) {
      alert('Please select both Start Date and End Date.');
      return;
    }
  
    setIsRunning(true); // Show the running state
  
    try {
      const dateRange = { start_date: startDate, end_date: endDate };
      const result = await downloadImagesForProject(
        authorization, 
        userId,        
        project.id,   
        dateRange,     
        project.aoi    
      );
  
      if (result.status === 'success') {
        alert(result.message); 
      } else {
        alert(result.message); 
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };
  

  // Render content based on the fetched image
//   const renderContent = () => {
//     if (fetchedImage) {
//       return (
//         <Box
//           sx={{
//             height: '300px',
//             backgroundImage: `url(${fetchedImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             borderRadius: '10px',
//           }}
//         />
//       );
//     }

//     return <Box sx={{ height: '300px', backgroundColor: '#e0e0e0', textAlign: 'center', lineHeight: '300px', borderRadius: '10px' }}>No Image Available</Box>;
//   };

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
            backgroundImage: `url(${fetchedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '10px',
          }}
        />
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
          {['sat', 'sat_ndvi', 'sat_gci', 'ndvi', 'gci', 'yield'].map((label, index) => (
            <Button
              key={label}
              onClick={() => fetchImageForTypeAndDate(label)}
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
              {['Satellite Image', 'NDVI Heat Map', 'GCI Heat Map', 'NDVI Plot', 'GCI Plot', 'Yield Estimate'][index]}
            </Button>
          ))}
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
    </Box>
  );
};

export default ProjectDetail;
