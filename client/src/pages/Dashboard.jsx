import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Buttons";
import axiosClient from "../api/axiosClient";
import Card from "../components/Card";
import PatternBackground from "../components/PatternedBackground";

const Dashboard = () => {
  const { token } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axiosClient.get("/tickets", {
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
    <div className="relative min-h-screen flex flex-row p-16">
      <PatternBackground
        lineColor="#B6B6B6"
        lineThickness={1}
        squareSize={70}
        fadeStart={5}
        fadeEnd={90}
        coverage={90}
        shape="square"
      />
      <div className="z-20 max-h-screen">
        <h1 className="text-xl font-bold mb-4 text-neutral-600">
          Your Dashboard
        </h1>
        <Card label="Number of Tickets">
          <h1 className="text-3xl font-semibold text-neutral-600">
            {tickets.length}
          </h1>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
