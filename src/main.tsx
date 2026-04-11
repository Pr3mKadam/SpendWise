import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./hooks/useCategories";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CategoryProvider>
        <App />
      </CategoryProvider>
    </AuthProvider>
  </StrictMode>
);
