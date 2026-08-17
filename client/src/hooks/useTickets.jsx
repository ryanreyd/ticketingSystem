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

  const getTickets = useCallback(async (params = {}) => {
    const res = await axios.get("/tickets", { ...authorizeAccess, params });
    return Array.isArray(res.data.tickets)
      ? res.data.tickets
      : Array.isArray(res.data)
        ? res.data
        : [];
  }, [axios, authorizeAccess]);

  const getTicketById = useCallback(async (ticketId) => {
    const res = await axios.get(`/tickets/${ticketId}`, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const createTicket = useCallback(async (ticketData) => {
    const res = await axios.post("/tickets", ticketData, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const updateTicket = useCallback(async (ticketId, updates) => {
    const res = await axios.put(
      `/tickets/${ticketId}`,
      updates,
      authorizeAccess
    );
    return res.data;
  }, [axios, authorizeAccess]);

  const deleteTicket = useCallback(async (ticketId) => {
    const res = await axios.delete(`/tickets/${ticketId}`, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const claimTicket = useCallback(async (ticketId) => {
    const res = await axios.post(`/tickets/${ticketId}/claim`, {}, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const assignTicket = useCallback(async (ticketId, assignedTo) => {
    const res = await axios.post(`/tickets/${ticketId}/assign`, { assignedTo }, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const changeTicketStatus = useCallback(async (ticketId, status) => {
    const res = await axios.post(`/tickets/${ticketId}/status`, { status }, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const changeTicketPriority = useCallback(async (ticketId, priority) => {
    const res = await axios.post(`/tickets/${ticketId}/priority`, { priority }, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const resolveTicket = useCallback(async (ticketId, resolution) => {
    const res = await axios.post(`/tickets/${ticketId}/resolve`, { resolution }, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const reopenTicket = useCallback(async (ticketId) => {
    const res = await axios.post(`/tickets/${ticketId}/reopen`, {}, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const closeTicket = useCallback(async (ticketId) => {
    const res = await axios.post(`/tickets/${ticketId}/close`, {}, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const getTicketLedger = useCallback(async (ticketId) => {
    const res = await axios.get(`/tickets/${ticketId}/ledger`, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  return {
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    claimTicket,
    assignTicket,
    changeTicketStatus,
    changeTicketPriority,
    resolveTicket,
    reopenTicket,
    closeTicket,
    getTicketLedger,
  };
};
