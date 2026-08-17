import React, { useContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TicketManagement from "./pages/TicketManagement";
import UserManagement from "./pages/admin/UserManagement";
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
  const { token, logout } = useContext(AuthContext);
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getMe();
        setMe(data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
        } else {
          console.error("Failed to load current user", err);
        }
      } finally {
        setMeLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    } else {
      setMeLoading(false);
    }
  }, [getMe, token, logout]);

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
          {!meLoading && me && (
            <>
              <Route path="status_401" element={<Status_401 />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ticketsManagement" element={<TicketManagement />} />

              <Route
                path="/"
                element={<Navigate to="/ticketsManagement" />}
              />

              <Route
                path="/usersManagement"
                element={
                  me.role === ROLES.ADMIN || me.role === ROLES.SUPPORT ? (
                    <UserManagement />
                  ) : (
                    <Navigate to="/ticketsManagement" />
                  )
                }
              />
            </>
          )}
        </Route>

        <Route
          path="*"
          element={<Navigate to={token ? "/ticketsManagement" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;