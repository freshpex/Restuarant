import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaUsers, FaUtensils, FaChartLine, FaShoppingCart, FaTachometerAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Tim's Kitchen</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-gray-400 text-sm">Tim's Kitchen Management</p>
          </div>
          
          <nav className="space-y-1">
            <Link 
              to="/admin" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </Link>
            
            <Link 
              to="/admin/users" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/users') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaUsers className="mr-3" />
              User Management
            </Link>
            
            <Link 
              to="/admin/foods" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/foods') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaUtensils className="mr-3" />
              Food Management
            </Link>
            
            <Link 
              to="/admin/orders" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/orders') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaShoppingCart className="mr-3" />
              Orders
            </Link>
            
            <Link 
              to="/admin/analytics" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/analytics') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaChartLine className="mr-3" />
              Analytics
            </Link>
          </nav>
          
          <div className="absolute bottom-0 left-0 p-4 w-64">
            <Link
              to="/"
              className="flex items-center text-sm text-gray-400 hover:text-white"
            >
              Back to Main Site
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
