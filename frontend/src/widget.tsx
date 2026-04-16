import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import ChatWidget from "./components/ChatWidget";
import theme from "./theme";

function mountWidget(config?: { apiUrl?: string; containerId?: string }) {
  const containerId = config?.containerId || "ai-booking-widget";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <ChatWidget apiUrl={config?.apiUrl} />
      </ChakraProvider>
    </React.StrictMode>
  );
}

// Auto-mount if loaded via script tag with data attributes
const currentScript = document.currentScript as HTMLScriptElement | null;
if (currentScript) {
  const apiUrl = currentScript.getAttribute("data-api-url") || undefined;
  window.addEventListener("DOMContentLoaded", () => mountWidget({ apiUrl }));
}

// Expose global mount function
(window as any).AiBookingWidget = { mount: mountWidget };
