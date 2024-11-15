export const login = async (username, password) => {
    // Mocking an API call, replace with actual API logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          resolve({ status: 'success' });
        } else {
          reject({ status: 'error', message: 'Invalid credentials' });
        }
      }, 1000);
    });
  };
  
  export const signUp = async (username, password, email) => {
    // Mocking an API call, replace with actual API logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password && email) {
          resolve({ status: 'success' });
        } else {
          reject({ status: 'error', message: 'All fields are required' });
        }
      }, 1000);
    });
  };
  