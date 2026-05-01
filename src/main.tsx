import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./hooks/useCategories";


// Import and register the virtual PWA service worker
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker explicitly with auto update
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>

        <CategoryProvider>
          <App />
        </CategoryProvider>

    </AuthProvider>
  </StrictMode>
);
