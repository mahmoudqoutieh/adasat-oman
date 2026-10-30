import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { App } from "./App";
import "./site.css";

const root = document.getElementById("root");
if (root) {
  const app = (
    <StrictMode>
      <App />
    </StrictMode>
  );
  // The production build pre-renders the page, so hydrate when markup exists.
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
