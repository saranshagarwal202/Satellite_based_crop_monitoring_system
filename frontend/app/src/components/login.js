import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Avatar, Paper, Grid, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import * as constants from '../config/constants';
import { PRIMARY_COLOR, TEXT_COLOR } from '../config/colors';
import { login } from '../services/authservice';  
import { LoginPageImage1, LoginPageImage2 } from '../config/images'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  

  const handleLogin = async () => {
    try {
      const response = await login(username, password);
      alert('Login successful!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={8} md={6} component={Paper} elevation={6} square>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" sx={{ color: TEXT_COLOR, fontWeight: 300, mb: 3, fontSize: '1.5rem' }}>
            {constants.APP_TITLE}  
          </Typography>
          <Avatar sx={{ m: 1, bgcolor: PRIMARY_COLOR }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={constants.USERNAME_LABEL}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={constants.PASSWORD_LABEL}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: PRIMARY_COLOR }}}
              onClick={handleLogin}
            >
              {constants.LOGIN_BUTTON_TEXT}
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                 Don't have an account?{' '}<a href="/signup" style={{ color: PRIMARY_COLOR }}>Sign up here</a>  
            </Typography>

            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/dashboard')}  
              >
                Skip to root
              </Button>
            </Grid>

          </Box>
        </Box>
      </Grid>

      <Grid item xs={false} sm={4} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${LoginPageImage1})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',  // Ensures the image fits without clipping
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${LoginPageImage2})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',  // Ensures the image fits without clipping
            backgroundPosition: 'center',
          }}
        />
      </Grid>
    </Grid>
  );
}

export default Login;
