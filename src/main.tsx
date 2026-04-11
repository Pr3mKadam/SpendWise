import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./hooks/useCategories";
import { ParentalControlProvider } from "./contexts/ParentalControlContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ParentalControlProvider>
        <CategoryProvider>
          <App />
        </CategoryProvider>
      </ParentalControlProvider>
    </AuthProvider>
  </StrictMode>
);
