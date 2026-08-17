import React, { useContext, useEffect, useState } from "react";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TicketManagement from "./pages/TicketManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import SubmitterDashboard from "./pages/SubmitterDashboard";
import Layout from "./sections/Layout";
import SetupPage from "./pages/SetupPage";
import axiosClient from "./api/axiosClient";
import { AuthContext } from "./context/AuthContext";
import { useUsers } from "./hooks/useUsers";
import { ROLES } from "./constants/roles";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Status_401 from "./pages/errors/Status_401";
import { FiLoader } from "react-icons/fi";

const App = () => {
  const { getMe } = useUsers();
  const { token } = useContext(AuthContext);
  const [me, setMe] = useState([]);
  const [setupComplete, setSetupComplete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getMe();
        setMe(data);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Failed to load current user", err);
        }
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [getMe, token]);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await axiosClient.get("/setup/status");
        setSetupComplete(res.data.setupComplete);
      } catch (err) {
        console.error("Failed to check setup status", err);
        setSetupComplete(true);
      }
    };
    checkSetup();
  }, []);

  if (setupComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-3xl text-indigo-500" />
      </div>
    );
  }

  if (setupComplete === false) {
    return (
      <Router>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/" element={<SetupPage />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/setup"
          element={setupComplete ? <Navigate to="/login" /> : <SetupPage />}
        />
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />}
        />

        <Route element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route path="status_401" element={<Status_401 />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ticketsManagement" element={<TicketManagement />} />

          <Route
            path="/admin"
            element={
              me.role === ROLES.ADMIN ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          <Route
            path="/support"
            element={
              me.role === ROLES.SUPPORT ? (
                <SupportDashboard />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          <Route
            path="/"
            element={
              me.role !== ROLES.ADMIN && me.role !== ROLES.SUPPORT
                ? <SubmitterDashboard />
                : me.role === ROLES.ADMIN ? (
                    <Navigate to="/admin" />
                  ) : (
                    <Navigate to="/support" />
                  )
            }
          />

          <Route
            path="/usersManagement"
            element={
              me.role === ROLES.ADMIN || me.role === ROLES.SUPPORT ? (
                <UserManagement />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;