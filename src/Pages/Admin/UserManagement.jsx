import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FaUser, FaUserShield, FaUserCog, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (email, newRole) => {
    try {
      setUpdating(prev => ({ ...prev, [email]: true }));
      
      const response = await fetch(`${API_URL}/admin/users/${email}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      toast.success(`User role updated to ${newRole}`);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.email === email ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      toast.error(error.message || 'Error updating user role');
    } finally {
      setUpdating(prev => ({ ...prev, [email]: false }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | User Management</title>
      </Helmet>
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id || user.email}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={user.profileImage}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                              <FaUser className="text-gray-600" />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || user.displayName || 'No Name'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'admin' ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <FaUserShield className="mr-1" /> Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <FaUser className="mr-1" /> Member
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {updating[user.email] ? (
                          <span className="text-gray-500 flex items-center">
                            <FaSpinner className="animate-spin mr-1" /> Updating...
                          </span>
                        ) : user.role === 'admin' ? (
                          <button
                            onClick={() => changeRole(user.email, 'member')}
                            className="text-yellow-600 hover:text-yellow-900 flex items-center"
                          >
                            <FaUserCog className="mr-1" /> Make Member
                          </button>
                        ) : (
                          <button
                            onClick={() => changeRole(user.email, 'admin')}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaUserShield className="mr-1" /> Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center p-6 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserManagement;
