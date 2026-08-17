import { useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

export const useComments = () => {
  const { axios, token } = useContext(AuthContext);
  const authorizeAccess = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getComments = useCallback(async (ticketId) => {
    const res = await axios.get(`/tickets/${ticketId}/comments`, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const createComment = useCallback(async (ticketId, content, isInternal = false) => {
    const res = await axios.post(`/tickets/${ticketId}/comments`, { content, isInternal }, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  const deleteComment = useCallback(async (ticketId, commentId) => {
    const res = await axios.delete(`/tickets/${ticketId}/comments/${commentId}`, authorizeAccess);
    return res.data;
  }, [axios, authorizeAccess]);

  return { getComments, createComment, deleteComment };
};
