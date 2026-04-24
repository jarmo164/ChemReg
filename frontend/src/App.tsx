import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import ChemicalRegister from "./pages/ChemicalRegister";
import InventoryRegister from "./pages/InventoryRegister";
import SdsManagement from "./pages/SdsManagement";
import RiskAssessments from "./pages/RiskAssessments";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import UrgentAlerts from "./pages/UrgentAlerts";
import RequireAuth from "./auth/RequireAuth";
import { isAuthenticated } from "./auth/auth";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated() ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                    element={
                        <RequireAuth>
                            <Layout />
                        </RequireAuth>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/chemicals" element={<ChemicalRegister />} />
                    <Route path="/inventory" element={<InventoryRegister />} />
                    <Route path="/sds" element={<SdsManagement />} />
                    <Route path="/risk" element={<RiskAssessments />} />
                    <Route path="/compliance" element={<Compliance />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/alerts" element={<UrgentAlerts />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
