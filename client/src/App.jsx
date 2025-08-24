import React, { useContext, useEffect, useState } from "react";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TicketManagement from "./pages/TicketManagement";
import UserManagement from "./pages/admin/UserManagement";
import Layout from "./sections/Layout";
import { AuthContext } from "./context/AuthContext";
import { useUsers } from "./hooks/useUsers";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Status_401 from "./pages/errors/Status_401";

const App = () => {
  const { getMe } = useUsers();
  const [me, setMe] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getMe();
        setMe(data);
      } catch (err) {
        console.error("Failed to load tickets", err);
      }
    };
    fetchUsers();
  }, [getMe]);

  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
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
            element={
              me.role === "admin" ? (
                <UserManagement />
              ) : (
                <Navigate to="/status_401" />
              )
            }
            path="/usersManagement"
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
