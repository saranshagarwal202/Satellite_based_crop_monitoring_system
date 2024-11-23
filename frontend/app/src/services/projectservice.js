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
        seeding_date: projectData.seeding_date,
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

export const downloadProjectImages = async (authorization, userId, projectId, dateRange) => {
  try {
    const response = await jobRunnerInstance.post(
      `/api/external/projects/${projectId}/download_images`,
      {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      },
      {
        headers: {
          authorization,
          user_id: userId,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 202) {
      return { status: 'success', message: 'Images are being downloaded in the background.' };
    } else {
      return { status: 'error', message: 'Failed to initiate image download.' };
    }
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

export const getImageByTypeAndDate = async (authorization, userId, projectId, imageType, dateOfInterest) => {
  try {
    const response = await jobRunnerInstance.post(
      `/api/external/projects/${imageType}/image`,
      {
        date_of_interest: dateOfInterest,
      },
      {
        headers: {
          authorization,
          user_id: userId,
          project_id: projectId,
          'Content-Type': 'application/json',
        },
        responseType: 'blob', 
      }
    );

    if (response.status === 200) {
      return {
        status: 'success',
        data: response.data, 
      };
    } else {
      return {
        status: 'error',
        message: 'Failed to retrieve the image.',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || error.message,
    };
  }
};
