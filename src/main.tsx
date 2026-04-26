import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./hooks/useCategories";
import { ParentalControlProvider } from "./contexts/ParentalControlContext";

// Import and register the virtual PWA service worker
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker explicitly with auto update
registerSW({ immediate: true });

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <AuthProvider>
        <ParentalControlProvider>
          <CategoryProvider>
            <App />
          </CategoryProvider>
        </ParentalControlProvider>
      </AuthProvider>
    </ConvexProvider>
  </StrictMode>
);
