import React, { useContext } from "react";
import LoginPage from "./pages/loginPage";
import Dashboard from "./pages/Dashboard";
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
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
