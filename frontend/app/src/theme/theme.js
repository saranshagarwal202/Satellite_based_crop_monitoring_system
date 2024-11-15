// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import { PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, TEXT_COLOR } from '../config/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR,
    },
    secondary: {
      main: SECONDARY_COLOR,
    },
    background: {
      default: ACCENT_COLOR,    // Light leafy background
    },
    text: {
      primary: TEXT_COLOR,      // Dark green for main text
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',  // You can customize this as needed
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',  // Default color on hover
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',  // Border color on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',  // Border color on focus
            borderWidth: '2px',    // Thicker border when focused
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: 'black',  // Label color when focused
          },
        },
      },
    },
  },
});

export default theme;
