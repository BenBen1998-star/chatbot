import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  direction: "rtl",
  fonts: {
    heading: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    body: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
  },
  shadows: {
    sm: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)",
    md: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  },
  styles: {
    global: {
      body: {
        bg: "#f4f6f9",
      },
    },
  },
  components: {
    Button: {
      defaultProps: { borderRadius: "lg" },
      baseStyle: {
        fontWeight: "500",
      },
    },
    Input: {
      defaultProps: { focusBorderColor: "brand.400" },
      baseStyle: {
        field: { borderRadius: "lg" },
      },
    },
    Textarea: {
      defaultProps: { focusBorderColor: "brand.400" },
    },
    Select: {
      defaultProps: { focusBorderColor: "brand.400" },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 2,
        fontWeight: "600",
      },
    },
  },
});

export default theme;
