import React, { useState, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import axiosClient from "../../api/axiosClient";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    console.log(user);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    if (!token) return;

    const getUser = async () => {
      try {
        const res = await axiosClient.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
        logout();
      }
    };

    getUser();
  }, [token]);

  const value = { token, login, logout, user, axios: axiosClient };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
