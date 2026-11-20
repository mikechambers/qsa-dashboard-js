import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import App from "./App";
import ConfigScreen from "@/screens/config/ConfigScreen";
import DashboardScreen from "@/screens/dashboard/DashboardScreen";
import { DASHBOARD_PATH, SETTINGS_PATH } from "@/consts/config";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route
                        index
                        element={<Navigate to={DASHBOARD_PATH} replace />}
                    />
                    <Route path={SETTINGS_PATH} element={<ConfigScreen />} />
                    <Route
                        path={`${DASHBOARD_PATH}/:callsign?/:grid?`}
                        element={<DashboardScreen />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
