import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00843D", // 7-Eleven Green
      light: "#339d63",
      dark: "#005c2a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#F26522", // 7-Eleven Orange/Red Accent
      light: "#f4834e",
      dark: "#a94617",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8f9fa", // Clean, light background
      paper: "#ffffff",
    },
    text: {
      primary: "#212529",
      secondary: "#6c757d",
    },
    divider: "#e9ecef",
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#006c32",
          },
        },
        containedSecondary: {
          "&:hover": {
            backgroundColor: "#d75217",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e9ecef",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#212529",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #e9ecef",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: "#f8f9fa",
        },
      },
    },
  },
});

export default theme;
