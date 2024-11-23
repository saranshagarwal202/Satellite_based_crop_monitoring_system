// import React, { useState, useEffect } from 'react';
// import Sidebar from '../Sidebar/Sidebar';
// import ProjectDetail from '../ProjectDetail/ProjectDetail';
// import TopBar from '../TopBar/TopBar';
// import { getUserProjects } from '../../services/projectservice';

// const Dashboard = () => {
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [selectedDate, setSelectedDate] = useState('Sep 15, 2023');
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       const token = localStorage.getItem('authToken');
//       const userId = localStorage.getItem('userId');
  
//       if (!token || !userId) {
//         alert('User not authenticated.');
//         setLoading(false);
//         return;
//       }
  
//       const response = await getUserProjects(token, userId);
  
//       if (response.status === 'success') {
//         // Map the server response to match the expected project structure
//         // const mappedProjects = response.data.map((project, index) => ({
//         //   id: project._id,
//         //   name: project.farm_name,
//         //   crop: project.crop,
//         //   color: getDynamicColor(index), // Assign a color dynamically
//         // }));

//         const mappedProjects = response.data.map((project, index) => ({
//             id: project._id,               // Project ID
//             name: project.farm_name,       // Farm name
//             crop: project.crop || 'N/A',   // Crop (fallback to 'N/A' if undefined)
//             color: getDynamicColor(index), // Assign a dynamic color
//           }));
          
//           alert('Mapped Projects:', mappedProjects);
  
//         setProjects(mappedProjects); // Store the mapped projects in state
//       } else {
//         console.error(`Error fetching projects: ${response.message}`);
//         alert(`Error fetching projects: ${response.message}`);
//       }
  
//       setLoading(false);
//     };
  
//     fetchProjects();
//   }, []);

//   // Get a dynamic color for the project
//   const getDynamicColor = (index) => {
//     const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFD433'];
//     return colors[index % colors.length];
//   };

//   const handleDateChange = (newDate) => {
//     const formattedDate = `Oct ${newDate}, 2024`;
//     setSelectedDate(formattedDate);
//     console.log('Selected Date:', formattedDate);
//   };

//   if (loading) {
//     return <div>Loading projects...</div>;
//   }

//   return (
//     <div style={{ display: 'flex', height: '100vh' }}>
//       <Sidebar
//         projects={projects}
//         onProjectSelect={setSelectedProject}
//         user={{ name: 'User' }}
//       />

//       <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
//         <TopBar selectedDate={selectedDate} onDateChange={handleDateChange} />

//         <div style={{ padding: '20px', flexGrow: 1 }}>
//           {selectedProject ? (
//             <ProjectDetail project={selectedProject} />
//           ) : (
//             <h1>Select a project to view details</h1>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ProjectDetail from '../ProjectDetail/ProjectDetail';
import { getUserProjects } from '../../services/projectservice';

const Dashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        alert('User not authenticated.');
        setLoading(false);
        return;
      }

      const response = await getUserProjects(token, userId);

      if (response.status === 'success') {
        const mappedProjects = response.data.map((project, index) => ({
          id: project._id,
          name: project.farm_name,
          crop: project.crop || 'N/A',
          color: getDynamicColor(index),
        }));

        setProjects(mappedProjects);
      } else {
        console.error(`Error fetching projects: ${response.message}`);
      }

      setLoading(false);
    };

    fetchProjects();
  }, []);

  const getDynamicColor = (index) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFD433'];
    return colors[index % colors.length];
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        projects={projects}
        onProjectSelect={setSelectedProject}
        user={{ name: 'User' }}
      />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
