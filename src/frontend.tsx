/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
// import { App } from "./App";
import VoiceFlowUI from "./pages/VoiceFlowUI";
import { ClerkProvider } from '@clerk/clerk-react'

// Define a workaround for Vite environment variables in Bun
const ENV = {
  VITE_CLERK_PUBLISHABLE_KEY: "pk_test_d29ya2luZy1iYXJuYWNsZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk"
};

const PUBLISHABLE_KEY = ENV.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <VoiceFlowUI />
      {/* <App /> */}
    </ClerkProvider>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
