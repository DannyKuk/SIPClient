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
              borderColor: '#8ecae6', // Change the border color
            },
            '&:hover fieldset': {
              borderColor: '#8ecae6', // Change the border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8ecae6', // Change the border color when focused
            },
          },
          '& .MuiInputLabel-root': {
            color: '#8ecae6', // Change the label color
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#8ecae6', // Change the label color when focused
          },
        },
      },
    },
  },
});

export default theme;
