import React, { useState, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import axiosClient from "../../api/axiosClient";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  const register = async (formData) => {
    console.log(formData);

    try {
      const res = await axiosClient.post("/auth/register", formData);
      const newToken = res.data?.token;

      if (newToken) {
        login(newToken);
        return { success: true, token: newToken };
      } else {
        console.error("Registration succeeded but no token returned");
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
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

  const value = { token, register, login, logout, user, axios: axiosClient };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
