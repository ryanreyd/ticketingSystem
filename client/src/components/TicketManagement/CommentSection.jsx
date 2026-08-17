import { useState, useEffect } from "react";
import { useComments } from "../../hooks/useComments";

const CommentSection = ({ ticketId, user }) => {
  const { getComments, createComment, deleteComment } = useComments();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canAddInternal = user?.role === "admin" || user?.role === "support";

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(ticketId);
        setComments(data);
      } catch {
        setError("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [ticketId, getComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const comment = await createComment(ticketId, newComment, isInternal);
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      setIsInternal(false);
    } catch {
      setError("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(ticketId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      setError("Failed to delete comment.");
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading comments...</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment._id} className="border border-gray-100 rounded-md p-3 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">{comment.author?.fullname}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
                {comment.isInternal && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Internal</span>
                )}
              </div>
              {(user?.role === "admin" || comment.author?._id === user?._id) && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-xs text-gray-400 hover:text-red-600 transition"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 italic">No comments yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {canAddInternal && (
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="accent-blue-500"
            />
            Internal note (visible only to support staff)
          </label>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-blue-600 text-white text-sm py-1.5 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
