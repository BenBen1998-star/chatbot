import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { I18nProvider } from "./i18n";
import theme from "./theme";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ChakraProvider>
  </StrictMode>
);
