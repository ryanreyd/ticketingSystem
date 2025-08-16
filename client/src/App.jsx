import React, { useContext } from "react";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TicketManagement from "./pages/TicketManagement";
import UserManagement from "./pages/UserManagement";
import Layout from "./sections/Layout";
import { AuthContext } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const App = () => {
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ticketsManagement" element={<TicketManagement />} />
          <Route path="/usersManagement" element={<UserManagement />} />
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
