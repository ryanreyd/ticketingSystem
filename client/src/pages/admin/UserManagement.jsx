import { useEffect, useState, useCallback, useContext, memo } from "react";
import { useUsers } from "../../hooks/useUsers";
import { AuthContext } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import Badge from "../../components/Badge";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Button from "../../components/Buttons";
import TextInput from "../../components/TextInput";
import DropdownMenu from "../../components/DropdownMenu";
import axiosClient from "../../api/axiosClient";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiKey,
  FiPower,
  FiTrash2,
} from "react-icons/fi";
import { ROLES } from "../../constants/roles";

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const { getUsers, createUser, updateUser, deleteUser } = useUsers();
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: ROLES.USER,
    departmentId: "",
    branchId: "",
    viberPhone: "",
  });

  const [resetPassword, setResetPassword] = useState("");

  const fetchLookups = async () => {
    try {
      const [deptRes, branchRes] = await Promise.all([
        axiosClient.get("/departments?active=true"),
        axiosClient.get("/branches?active=true"),
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
    } catch {
      // silent fail for lookups
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsFetching(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const data = await getUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [getUsers, page, roleFilter, search]);

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const resetForm = () => {
    setFormData({
      fullname: "",
      email: "",
      password: "",
      role: ROLES.USER,
      departmentId: "",
      branchId: "",
      viberPhone: "",
    });
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      fullname: user.fullname || "",
      email: user.email || "",
      password: "",
      role: user.role || ROLES.USER,
      departmentId: user.department?._id || "",
      branchId: user.branch?._id || "",
      viberPhone: user.viberPhone || "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const openView = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openReset = (user) => {
    setSelectedUser(user);
    setResetPassword("");
    setIsResetOpen(true);
  };

  const handleDeactivate = async (user) => {
    try {
      await updateUser(user._id, { isActive: false });
      setToast({ message: "User deactivated successfully", type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to deactivate user",
        type: "error",
      });
    }
  };

  const handleActivate = async (user) => {
    try {
      await updateUser(user._id, { isActive: true });
      setToast({ message: "User activated successfully", type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to activate user",
        type: "error",
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setIsCreateOpen(false);
      resetForm();
      setToast({ message: "User created successfully", type: "success" });
      setPage(1);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to create user",
        type: "error",
      });
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const updates = { ...formData };
      if (!updates.password) delete updates.password;
      await updateUser(selectedUser._id, updates);
      setIsEditOpen(false);
      setSelectedUser(null);
      setToast({ message: "User updated successfully", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update user",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser._id);
      setIsDeleteOpen(false);
      setSelectedUser(null);
      setToast({ message: "User deleted successfully", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to delete user",
        type: "error",
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser._id, { password: resetPassword });
      setIsResetOpen(false);
      setSelectedUser(null);
      setResetPassword("");
      setToast({ message: "Password reset successfully", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to reset password",
        type: "error",
      });
    }
  };

  const renderFormFields = () => (
    <form
      onSubmit={selectedUser ? handleEdit : handleCreate}
      className="space-y-4"
    >
      <TextInput
        label="Fullname"
        name="fullname"
        value={formData.fullname}
        onChange={(e) =>
          setFormData((p) => ({ ...p, fullname: e.target.value }))
        }
        placeholder="Enter full name"
        required
      />
      <TextInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
        placeholder="name@company.com"
        required
      />
      <TextInput
        label={selectedUser ? "New Password (leave blank to keep)" : "Password"}
        name="password"
        type="password"
        value={formData.password}
        onChange={(e) =>
          setFormData((p) => ({ ...p, password: e.target.value }))
        }
        placeholder={
          selectedUser ? "Leave blank to keep current" : "Min 6 chars"
        }
        required={!selectedUser}
      />
      {user?.role === ROLES.ADMIN && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) =>
              setFormData((p) => ({ ...p, role: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border"
          >
            <option value={ROLES.USER}>User</option>
            <option value={ROLES.SUPPORT}>Support</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={(e) =>
            setFormData((p) => ({ ...p, departmentId: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border"
        >
          <option value="">Select department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Branch
        </label>
        <select
          name="branchId"
          value={formData.branchId}
          onChange={(e) =>
            setFormData((p) => ({ ...p, branchId: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border"
        >
          <option value="">Select branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>
      <TextInput
        label="Viber Phone Number"
        name="viberPhone"
        value={formData.viberPhone}
        onChange={(e) =>
          setFormData((p) => ({ ...p, viberPhone: e.target.value }))
        }
        placeholder="09171234567"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          onClick={() => {
            setIsCreateOpen(false);
            setIsEditOpen(false);
          }}
          className="bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          Cancel
        </Button>
        <Button type="submit">{selectedUser ? "Update" : "Create"}</Button>
      </div>
    </form>
  );

  const ActionMenu = memo(({ targetUser }) => (
    <DropdownMenu
      align="right"
      trigger={
        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      }
    >
      <button
        onClick={() => openView(targetUser)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FiEye size={16} className="text-gray-400" />
        <span>View Profile</span>
      </button>
      <button
        onClick={() => openEdit(targetUser)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FiEdit2 size={16} className="text-gray-400" />
        <span>Edit User</span>
      </button>
      <button
        onClick={() => openReset(targetUser)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FiKey size={16} className="text-gray-400" />
        <span>Reset Password</span>
      </button>
      {user?.role === ROLES.ADMIN && (
        <button
          onClick={() =>
            targetUser.isActive === false
              ? handleActivate(targetUser)
              : handleDeactivate(targetUser)
          }
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiPower
            size={16}
            className={
              targetUser.isActive === false
                ? "text-green-500"
                : "text-amber-500"
            }
          />
          <span>
            {targetUser.isActive === false
              ? "Activate User"
              : "Deactivate User"}
          </span>
        </button>
      )}
      <div className="border-t border-gray-100 my-1 mx-2" />
      {user?.role === ROLES.ADMIN && (
        <button
          onClick={() => openDelete(targetUser)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiTrash2 size={16} className="text-red-400" />
          <span>Delete User</span>
        </button>
      )}
    </DropdownMenu>
  ));

  if (initialLoading) return <p className="p-6">Loading users...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {user?.role === ROLES.ADMIN && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            <FiPlus size={18} />
            <span className="font-medium">Add User</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name or email..."
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-300 focus:border"
        >
          <option value="">All roles</option>
          <option value={ROLES.ADMIN}>Admin</option>
          <option value={ROLES.SUPPORT}>Support</option>
          <option value={ROLES.USER}>User</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow relative overflow-visible">
        {isFetching && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={
                      user.isActive === false
                        ? "opacity-60 bg-gray-50"
                        : "hover:bg-gray-50 transition-colors"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.branch?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.viberPhone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.profileCompleted ? (
                        <span className="text-xs text-green-600 font-medium">
                          Complete
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">
                          Incomplete
                        </span>
                      )}
                      {user.isActive === false && (
                        <span className="ml-2 text-xs text-red-600 font-medium">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu targetUser={user} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add User"
      >
        {renderFormFields()}
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit User"
      >
        {renderFormFields()}
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="User Profile"
      >
        {selectedUser && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{selectedUser.fullname}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{selectedUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Role:</span>
              <Badge variant={selectedUser.role}>{selectedUser.role}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Department:</span>
              <span>{selectedUser.department?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Branch:</span>
              <span>{selectedUser.branch?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Viber:</span>
              <span>{selectedUser.viberPhone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span>
                {selectedUser.isActive === false ? "Deactivated" : "Active"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Profile:</span>
              <span>
                {selectedUser.profileCompleted ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <TextInput
            label="New Password"
            name="password"
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="Min 6 chars"
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setIsResetOpen(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button type="submit">Reset Password</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.fullname}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default UserManagement;
