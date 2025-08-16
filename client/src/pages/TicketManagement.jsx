import { useEffect, useState } from "react";
import { useTickets } from "../hooks/useTickets";

const TicketManagement = () => {
  const { getTickets } = useTickets();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTickets();
        setTickets(data);
        console.log(data);
      } catch (err) {
        console.error("Failed to load tickets", err);
      }
    };
    fetchTickets();
  }, [getTickets]);

  return (
    <div className="p-6">
      <h1 className="font-semibold mb-4">Submitted Tickets</h1>
      <ul className="flex flex-col gap-2">
        {tickets.map((ticket) => (
          <li
            className=" flex bg-white p-4 rounded-lg shadow-md flex-col max-w-[300px]"
            key={ticket._id}
          >
            <h1 className="font-bold text-neutral-700">{ticket.title}</h1>
            <p className="text-slate-500 text-shadow-amber-400">
              <span className="font-semibold">Created by: </span>
              {ticket?.createdBy?.fullname}
            </p>
            <p className="text-slate-500 text-sm">
              <span className="font-semibold"> Ticket ID:</span>{" "}
              <span className="italic">{ticket._id}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TicketManagement;
