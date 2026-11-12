import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import App from "./App";
import ConfigScreen from "./screens/ConfigScreen/ConfigScreen";
import DashboardScreen from "./screens/DashboardScreen/DashboardScreen";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<App />}>
      <Route index element={<ConfigScreen />} />
      <Route path="dashboard/:callsign?/:grid?" element={<DashboardScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    </Routes>
  </BrowserRouter>
  </StrictMode>,
);
