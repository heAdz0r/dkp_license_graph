import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5',  // Индиго цвет, ранее использовавшийся в проекте
      light: '#818cf8',
      dark: '#3730a3',
    },
    secondary: {
      main: '#10b981',  // Зеленый цвет, ранее использовавшийся в проекте
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e5e7eb',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f3f4f6',
        },
      },
    },
  },
});

export default theme;