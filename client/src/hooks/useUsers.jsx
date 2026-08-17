import { useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

export const useUsers = () => {
  const { axios, token } = useContext(AuthContext);

  const authorizeAccess = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getUsers = useCallback(async (params = {}) => {
    const res = await axios.get("/users", { ...authorizeAccess, params });
    return res.data;
  }, [axios, authorizeAccess]);

  const getMe = useCallback(async () => {
    const res = await axios.get("/users/me", authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const createUser = useCallback(async (userData) => {
    const res = await axios.post("/users", userData, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const updateUser = useCallback(async (userId, updates) => {
    const res = await axios.put(`/users/${userId}`, updates, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const deleteUser = useCallback(async (userId) => {
    const res = await axios.delete(`/users/${userId}`, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  return { getUsers, getMe, createUser, updateUser, deleteUser };
};
