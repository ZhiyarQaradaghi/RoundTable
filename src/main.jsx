import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { DiscussionsProvider } from "./context/Discussions";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DiscussionsProvider>
      <App />
    </DiscussionsProvider>
  </React.StrictMode>
);
