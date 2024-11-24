// import React, { useState, useEffect } from 'react';
// import Sidebar from '../Sidebar/Sidebar';
// import ProjectDetail from '../ProjectDetail/ProjectDetail';
// import { getUserProjects } from '../../services/projectservice';

// const Dashboard = () => {
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // const fetchProjects = async () => {
//     //   const token = localStorage.getItem('authToken');
//     //   const userId = localStorage.getItem('userId');

//     //   if (!token || !userId) {
//     //     alert('User not authenticated.');
//     //     setLoading(false);
//     //     return;
//     //   }

//     //   const response = await getUserProjects(token, userId);

//     //   if (response.status === 'success') {
//     //     const mappedProjects = response.data.map((project, index) => ({
//     //       id: project._id,
//     //       name: project.farm_name,
//     //       crop: project.crop || 'N/A',
//     //       color: getDynamicColor(index),
//     //     }));

//     //     setProjects(mappedProjects);
//     //   } else {
//     //     console.error(`Error fetching projects: ${response.message}`);
//     //   }

//     //   setLoading(false);
//     // };
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
//         // Record all fields from the API response
//         const mappedProjects = response.data.map((project, index) => ({
//           ...project, // Include all fields from the project
//           color: getDynamicColor(index), // Add dynamic color for Sidebar display
//         }));
    
//         setProjects(mappedProjects); // Store the full projects in state
//       } else {
//         console.error(`Error fetching projects: ${response.message}`);
//         alert(`Error fetching projects: ${response.message}`);
//       }
    
//       setLoading(false);
//     };
    

//     fetchProjects();
//   }, []);

//   const getDynamicColor = (index) => {
//     const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFD433'];
//     return colors[index % colors.length];
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
          aoi: project.aoi || [],
          seedingDate: project.seeding_date || 'N/A',
          createdAt: project.created_at || 'N/A',
          images: project.images || [],
          ndvi: project.ndvi || [],
          gci: project.gci || [],
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

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // alert(`Project Details:\n${JSON.stringify(project, null, 2)}`); // Display project details in an alert
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        projects={projects}
        onProjectSelect={handleProjectSelect}
        user={{ name: 'User' }}
      />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '20px', flexGrow: 1 }}>
          {selectedProject ? (
            <ProjectDetail
            projectData={selectedProject}
            userId={localStorage.getItem('userId')} // Pass userId
            authorization={localStorage.getItem('authToken')} // Pass authorization
            planetKey={localStorage.getItem('PLANET_API_KEY')}
          />
          ) : (
            <h1>Select a project to view details</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
