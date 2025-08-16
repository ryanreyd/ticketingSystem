import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useUsers = () => {
  const { axios, token } = useContext(AuthContext);

  const authorizeAccess = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const getUsers = async () => {
    const res = await axios.get("/users", authorizeAccess);
    return res.data;
  };
  return { getUsers };
};
