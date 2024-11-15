import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ProjectDetail from '../ProjectDetail/ProjectDetail';
import TopBar from '../TopBar/TopBar';  

const Dashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Sep 15, 2023');  

  const projects = [
    { id: 1, name: 'Project 1', acreage: 215.5, color: '#FF5733' },
    { id: 2, name: 'Project 2', acreage: 312.5, color: '#33FF57' },
    { id: 3, name: 'Project 3', acreage: 400.0, color: '#3357FF' },
    { id: 4, name: 'Project 4', acreage: 285.3, color: '#FFD433' },
    { id: 5, name: 'Project 5', acreage: 180.9, color: '#FF33F6' },
    { id: 6, name: 'Project 6', acreage: 320.0, color: '#33FFF2' },
    { id: 7, name: 'Project 7', acreage: 350.5, color: '#FF9633' },
    { id: 8, name: 'Project 8', acreage: 290.2, color: '#57FF33' },
    { id: 9, name: 'Project 9', acreage: 380.8, color: '#5733FF' },
    { id: 10, name: 'Project 10', acreage: 210.7, color: '#F733FF' },
  ];

  const handleDateChange = (newDate) => {
    const formattedDate = `Oct ${newDate}, 2024`;
    setSelectedDate(formattedDate);
    console.log('Selected Date:', formattedDate);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        projects={projects}
        onProjectSelect={setSelectedProject}
        user={{ name: 'User' }}
      />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <TopBar selectedDate={selectedDate} onDateChange={handleDateChange} />

        <div style={{ padding: '20px', flexGrow: 1 }}>
          {selectedProject ? (
            <ProjectDetail project={selectedProject} />
          ) : (
            <h1>Select a project to view details</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
