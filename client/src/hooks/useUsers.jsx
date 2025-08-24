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

  const getUsers = useCallback(async () => {
    const res = await axios.get("/users", authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]); // ✅ stable unless axios or token changes
  const getMe = useCallback(async () => {
    const res = await axios.get("/users/me", authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]); // ✅ stable unless axios or token changes

  return { getUsers, getMe };
};
