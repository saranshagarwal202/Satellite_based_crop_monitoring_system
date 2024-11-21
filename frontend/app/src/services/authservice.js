import axios from 'axios';

const jobRunnerInstance = axios.create({
  baseURL: process.env.REACT_APP_JOBRUNNER_API_URL,
});

console.log("REACT_APP_JOBRUNNER_API_URL:", jobRunnerInstance.defaults.baseURL);

export const signUp = async (username, password, email, planetApiKey) => {
  try {
    const response = await jobRunnerInstance.post('/api/external/auth/signup', {
      email,
      password,
      name: username,
      PLANET_API_KEY: planetApiKey,
    });
    return { status: 'success', data: response.data };
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || error.message,
    };
  }
};

export const login = async (email, password) => {
  try {
    const response = await jobRunnerInstance.post('/api/external/auth/login', {
      email, 
      password,
    });

    if (response.status === 200) {
      return {
        status: 'success',
        data: {
          user: response.data.user,       
          token: response.data.token,     
          expires_in: response.data.expires_in, 
        },
      };
    } else {
      return {
        status: 'error',
        message: 'Unexpected response from server.',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'An unexpected error occurred.',
    };
  }
};
