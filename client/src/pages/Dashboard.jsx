import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Buttons";
import axios from "axios";

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTickets(res.data); // assuming response is array of tickets
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Tickets</h1>
        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket._id} className="p-4 bg-gray-100 rounded">
                <p>
                  <strong>Title:</strong> {ticket.title}
                </p>
                <p>
                  <strong>Status:</strong> {ticket.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button onClick={logout}>Logout</Button>
    </div>
  );
};

export default Dashboard;
