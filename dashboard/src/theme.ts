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
  styles: {
    global: {
      body: {
        bg: "#f8f9fb",
      },
    },
  },
  components: {
    Button: {
      defaultProps: { borderRadius: "lg" },
    },
    Input: {
      defaultProps: { focusBorderColor: "brand.400" },
    },
    Textarea: {
      defaultProps: { focusBorderColor: "brand.400" },
    },
  },
});

export default theme;
