import axios from 'axios';

const jobRunnerInstance = axios.create({
  baseURL: process.env.REACT_APP_JOBRUNNER_API_URL,
});

console.log("REACT_APP_JOBRUNNER_API_URL:", jobRunnerInstance.defaults.baseURL);

export const getUserProjects = async (authorization, userId) => {
  try {
    const response = await jobRunnerInstance.get('/api/external/projects', {
      headers: {
        authorization,
        user_id: userId,
      },
    });
    return { status: 'success', data: response.data };
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || error.message,
    };
  }
};

export const addUserProject = async (authorization, userId, projectData) => {
  try {
    const response = await jobRunnerInstance.post(
      '/api/external/projects',
      {
        farm_name: projectData.farm_name,
        aoi: projectData.aoi,
        crop: projectData.crop,
        created_at: projectData.created_at,
      },
      {
        headers: {
          authorization,
          user_id: userId,
        },
      }
    );
    alert('$$$$ made api call to create a new project $$$$')
    return { status: 'success', data: response.data };
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getImageForProject = async (authorization, userId, projectId, imageRequest) => {
  try {
    const response = await jobRunnerInstance.post(
      `/api/external/projects/${projectId}/image`, 
      {
        date_of_interest: imageRequest.date_of_interest,
      },
      {
        headers: {
          authorization,
          user_id: userId,
        },
      }
    );
    return { status: 'success', data: response.data };
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || error.message,
    };
  }
};
