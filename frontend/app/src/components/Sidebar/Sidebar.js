import React from 'react';
import { List, ListItem, ListItemText, Divider, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';  

function Sidebar({ onProjectSelect, user, projects }) {
  const navigate = useNavigate();  

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '250px',
      backgroundColor: '#FFFFFF',
      padding: '20px',
      borderRight: '1px solid #ddd',
    }}>
      <Typography variant="h6" sx={{ color: '#333333', fontWeight: 'bold', marginBottom: '20px' }}>
        Welcome, {user.name}
      </Typography>
      <Divider sx={{ marginBottom: '15px' }} />

      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ paddingBottom: '10px' }}>
          {projects.map((project) => (
            <ListItem
              button
              key={project.id}
              onClick={() => onProjectSelect(project)} 
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#F9F9F9',
                borderRadius: '8px',
                marginBottom: '10px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: '#F1F1F1'
                }
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: project.color,
                borderRadius: '4px',
                marginRight: '12px'
              }}></div>
              <ListItemText
                primary={project.name}
                secondary={`${project.acreage} ac`}
                primaryTypographyProps={{ fontSize: '16px', fontWeight: '600', color: '#333333' }}
                secondaryTypographyProps={{ fontSize: '14px', color: '#666666' }}
              />
            </ListItem>
          ))}
        </List>
      </div>

      <div style={{ paddingTop: '10px', marginBottom: '40px' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#007AFF',
            color: 'white',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#005BBB'
            }
          }}
          fullWidth
          onClick={() => navigate('/create-project-pane')}
        >
          + New Project
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;