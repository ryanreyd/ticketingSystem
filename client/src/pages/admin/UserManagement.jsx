import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/useUsers";

const UserManagement = () => {
  const { getUsers } = useUsers();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load tickets", err);
      }
    };
    fetchUsers();
  }, [getUsers]);

  return (
    <div className="p-6">
      <h1 className="font-semibold mb-4">Users</h1>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li
            className=" flex bg-white px-4 py-2 rounded-lg shadow-md flex-col max-w-[300px]"
            key={user._id}
          >
            <h1 className="font-bold text-neutral-700">{user.fullname}</h1>

            <p className="text-slate-500 text-sm">
              <span className="font-semibold"> Role:</span>{" "}
              <span className="italic">{user.role}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
