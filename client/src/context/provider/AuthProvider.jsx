import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AuthContext } from "../AuthContext";
import axiosClient from "../../api/axiosClient";
import { ROLES } from "../../constants/roles";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  const login = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  const register = useCallback(async (formData) => {
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
  }, [login]);

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
  }, [token, logout]);

  const value = useMemo(
    () => ({ token, register, login, logout, user, axios: axiosClient, ROLES }),
    [token, user, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
