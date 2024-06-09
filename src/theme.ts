import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8ecae6',
    },
    secondary: {
      main: '#ffb703',
    },
    error: {
      main: '#e63946',
    },
    success: {
      main: '#06d6a0',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#8ecae6', // Border color
            },
            '&:hover fieldset': {
              borderColor: '#8ecae6', // Hover color
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8ecae6', // Focus color
            },
          },
          '& .MuiInputLabel-root': {
            color: '#8ecae6', // Label color
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#8ecae6', // Focused label color
          },
          input: {
            color: "#f7fff7", // Text Color
          },
        },
      },
    },
  },
});

export default theme;
