import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import {
  FaUser,
  FaUserShield,
  FaUserCog,
  FaSpinner,
  FaEllipsisV,
  FaUserEdit,
  FaTrashAlt,
  FaUtensils,
  FaMoneyBillWave,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { selectToken } from "../../redux/selectors";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [deletingUser, setDeletingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [mobileEditingUser, setMobileEditingUser] = useState(null);
  const [mobileRoleDropdownOpen, setMobileRoleDropdownOpen] = useState(false);
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (email) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${email}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      toast.success("User role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Error updating user role");
    }
  };

  const handleDeleteUser = async (email) => {
    try {
      setDeletingUser(email);

      const response = await fetch(`${API_URL}/admin/users/${email}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Error deleting user");
    } finally {
      setDeletingUser(null);
    }
  };

  const openDeleteConfirm = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const toggleDropdown = (e, userId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  // Handle mobile role editing
  const handleMobileEditRole = (user) => {
    setMobileEditingUser(user);
    setNewRole(user.role);
    setActiveDropdown(null);
    setMobileRoleDropdownOpen(true);
  };

  const saveMobileRoleChange = async () => {
    if (!mobileEditingUser) return;

    try {
      setUpdating((prev) => ({ ...prev, [mobileEditingUser.email]: true }));

      const response = await fetch(
        `${API_URL}/admin/users/${mobileEditingUser.email}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      toast.success(
        `Updated ${mobileEditingUser.name || mobileEditingUser.email}'s role to ${newRole}`,
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === mobileEditingUser.email
            ? { ...user, role: newRole }
            : user,
        ),
      );
    } catch (error) {
      toast.error(error.message || "Error updating user role");
    } finally {
      setUpdating((prev) => ({ ...prev, [mobileEditingUser.email]: false }));
      setMobileEditingUser(null);
      setMobileRoleDropdownOpen(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | User Management</title>
      </Helmet>
      <div className="bg-gray-50 min-h-screen p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            User Management
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={`desktop-${user._id || user.email}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.photoURL ? (
                              <img
                                className="h-10 w-10 rounded-full mr-3"
                                src={user.photoURL}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                <FaUser className="text-gray-600" />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.displayName || "No Name"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.email ? (
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="chef">Chef</option>
                              <option value="cashier">Cashier</option>
                              <option value="member">Member</option>
                            </select>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {user.role}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingUser === user.email ? (
                            <button
                              onClick={() => handleRoleChange(user.email)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUser(user.email);
                                setNewRole(user.role);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <FaUserEdit />
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteConfirm(user)}
                            className="text-red-600 hover:text-red-900"
                            disabled={
                              deletingUser === user.email ||
                              user.email === localStorage.getItem("userEmail")
                            }
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Shown only on Mobile */}
              <div className="md:hidden pb-12">
                {users.map((user) => (
                  <div
                    key={`mobile-${user._id || user.email}`}
                    className="border-b border-gray-200 py-4 px-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        {user.photoURL ? (
                          <img
                            className="h-10 w-10 rounded-full mr-3"
                            src={user.photoURL}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <FaUser className="text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || user.displayName || "No Name"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) =>
                            toggleDropdown(e, user._id || user.email)
                          }
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <FaEllipsisV />
                        </button>
                        {activeDropdown === (user._id || user.email) && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            {updating[user.email] ? (
                              <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                                <FaSpinner className="animate-spin mr-2" />{" "}
                                Updating...
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleMobileEditRole(user)}
                                  className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 flex items-center"
                                  disabled={updating[user.email]}
                                >
                                  <FaUserEdit className="inline mr-2" /> Edit
                                  Role
                                </button>

                                <button
                                  onClick={() => {
                                    openDeleteConfirm(user);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 flex items-center border-t border-gray-100"
                                  disabled={
                                    user.email ===
                                    localStorage.getItem("userEmail")
                                  }
                                >
                                  <FaTrashAlt className="inline mr-2" /> Delete
                                  User
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`
                        px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          ["admin", "manager", "chef", "cashier"].includes(
                            user.role,
                          )
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {user.role === "admin" ? (
                          <>
                            <FaUserShield className="mr-1" /> Admin
                          </>
                        ) : user.role === "manager" ? (
                          <>
                            <FaUserCog className="mr-1" /> Manager
                          </>
                        ) : user.role === "chef" ? (
                          <>
                            <FaUtensils className="mr-1" /> Chef
                          </>
                        ) : user.role === "cashier" ? (
                          <>
                            <FaMoneyBillWave className="mr-1" /> Cashier
                          </>
                        ) : (
                          <>
                            <FaUser className="mr-1" /> Member
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center p-6 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Role Edit Modal */}
      {mobileRoleDropdownOpen && mobileEditingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit User Role</h3>
            <p className="mb-4 text-sm text-gray-600">
              Update role for{" "}
              <span className="font-semibold">
                {mobileEditingUser.name || mobileEditingUser.email}
              </span>
            </p>

            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select New Role
              </label>
              <select
                id="role"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="chef">Chef</option>
                <option value="cashier">Cashier</option>
                <option value="member">Member</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setMobileEditingUser(null);
                  setMobileRoleDropdownOpen(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveMobileRoleChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                disabled={updating[mobileEditingUser.email]}
              >
                {updating[mobileEditingUser.email] ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p className="mb-4">
              Are you sure you want to delete user{" "}
              <span className="font-semibold">{userToDelete.email}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete.email)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                disabled={deletingUser === userToDelete.email}
              >
                {deletingUser === userToDelete.email ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
