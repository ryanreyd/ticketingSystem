import { useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

export const useTickets = () => {
  const { axios, token } = useContext(AuthContext);
  const authorizeAccess = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getTickets = useCallback(async () => {
    const res = await axios.get("/tickets", authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const createTicket = async (ticketData) => {
    const res = await axios.post("/tickets", authorizeAccess, ticketData);
    return res.data;
  };

  const updateTicket = async (ticketId, updates) => {
    const res = await axios.put(
      `/tickets/${ticketId}`,
      authorizeAccess,
      updates
    );
    return res.data;
  };

  const deleteTicket = async (ticketId) => {
    const res = await axios.delete(`/tickets/${ticketId}`, authorizeAccess);
    return res.data;
  };

  return { getTickets, createTicket, updateTicket, deleteTicket };
};
