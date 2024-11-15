import React, { useState } from 'react';
import { Button, TextField, Box, Avatar, Paper, Grid, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import * as constants from '../config/constants';
import { PRIMARY_COLOR, TEXT_COLOR } from '../config/colors';  
import { LoginPageImage1 } from '../config/images';  

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSignUp = async () => {
    try {
      alert('Sign-up successful!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={8} md={6} component={Paper} elevation={6} square>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" sx={{ color: TEXT_COLOR, fontWeight: 300, mb: 3 }}>
            {constants.SIGNUP_TITLE}
          </Typography>
          <Avatar sx={{ m: 1, bgcolor: PRIMARY_COLOR }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={constants.EMAIL_LABEL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
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
              autoComplete="new-password"
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: PRIMARY_COLOR } }}  
              onClick={handleSignUp}
            >
              {constants.SIGNUP_BUTTON_TEXT}
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: PRIMARY_COLOR }}>Log in here</a>  
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={false} sm={4} md={6} sx={{
        backgroundImage: `url(${LoginPageImage1})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
    </Grid>
  );
}

export default SignUp;
