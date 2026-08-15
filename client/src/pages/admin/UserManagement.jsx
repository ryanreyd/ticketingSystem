import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/useUsers";

const UserManagement = () => {
  const { getUsers } = useUsers();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data.users || data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getUsers]);

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="font-semibold mb-4">Users</h1>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li
            className="bg-white px-4 py-3 rounded-lg shadow-md flex flex-col gap-1 max-w-[450px]"
            key={user._id}
          >
            <h1 className="font-bold text-neutral-700">{user.fullname}</h1>
            <p className="text-slate-500 text-sm">{user.email}</p>

            <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-600">
              {user.department && (
                <span>
                  <span className="font-semibold">Dept:</span>{" "}
                  <span className="italic">{user.department.name}</span>
                </span>
              )}
              {user.branch && (
                <span>
                  <span className="font-semibold">Branch:</span>{" "}
                  <span className="italic">{user.branch.name}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span>
                <span className="font-semibold">Role:</span>{" "}
                <span className="italic">{user.role}</span>
              </span>
              {user.viberPhone && (
                <span>
                  <span className="font-semibold">Viber:</span>{" "}
                  <span className="italic">{user.viberPhone}</span>
                </span>
              )}
            </div>

            {!user.profileCompleted && (
              <span className="text-xs text-amber-600 font-medium mt-1">
                Profile incomplete
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
