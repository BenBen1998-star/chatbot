import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
  },
  colors: {
    brand: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    md: "0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.03)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
    hover: "0 8px 24px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04)",
    card: "0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)",
  },
  styles: {
    global: {
      body: {
        bg: "#f4f5f7",
      },
      "*": {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "10px",
        _focus: { boxShadow: "none" },
      },
    },
    Input: {
      defaultProps: { focusBorderColor: "brand.400" },
      variants: {
        outline: {
          field: {
            borderRadius: "8px",
            bg: "white",
            borderColor: "gray.200",
            _focus: { borderColor: "brand.400", boxShadow: "none" },
          },
        },
      },
    },
    Textarea: {
      defaultProps: { focusBorderColor: "brand.400" },
      variants: {
        outline: {
          borderRadius: "8px",
          bg: "white",
          borderColor: "gray.200",
          _focus: { borderColor: "brand.400", boxShadow: "none" },
        },
      },
    },
    Select: {
      defaultProps: { focusBorderColor: "brand.400" },
      variants: {
        outline: {
          field: {
            borderRadius: "8px",
            bg: "white",
            borderColor: "gray.200",
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 2.5,
        fontWeight: "700",
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "16px",
          shadow: "xl",
        },
      },
    },
  },
});

export default theme;
