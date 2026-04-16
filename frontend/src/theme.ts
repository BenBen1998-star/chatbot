import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  direction: "rtl",
  fonts: {
    heading: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    body: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
  },
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#b3e0ff",
      200: "#80caff",
      300: "#4db3ff",
      400: "#1a9dff",
      500: "#0084e6",
      600: "#0067b3",
      700: "#004a80",
      800: "#002d4d",
      900: "#00101a",
    },
  },
});

export default theme;
