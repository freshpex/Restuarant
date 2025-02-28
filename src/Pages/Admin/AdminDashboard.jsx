import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  FaUsers, FaUtensils, FaChartLine, FaShoppingCart, 
  FaTachometerAlt, FaBars, FaTimes 
} from 'react-icons/fa';

const AdminDashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Tim's Kitchen</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <button onClick={toggleSidebar} className="p-2">
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Sidebar - Desktop always visible, Mobile conditional */}
        <div className={`
          bg-gray-900 text-white 
          md:w-64 w-3/4 md:static fixed z-30
          min-h-screen transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 hidden md:block">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-gray-400 text-sm">Tim's Kitchen Management</p>
          </div>
          
          <nav className="space-y-1 p-4">
            <Link 
              to="/admin" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={closeSidebar}
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </Link>
            
            <Link 
              to="/admin/users" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/users') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={closeSidebar}
            >
              <FaUsers className="mr-3" />
              User Management
            </Link>
            
            <Link 
              to="/admin/foods" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/foods') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={closeSidebar}
            >
              <FaUtensils className="mr-3" />
              Food Management
            </Link>
            
            <Link 
              to="/admin/orders" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/orders') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={closeSidebar}
            >
              <FaShoppingCart className="mr-3" />
              Orders
            </Link>
            
            <Link 
              to="/admin/analytics" 
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/admin/analytics') ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={closeSidebar}
            >
              <FaChartLine className="mr-3" />
              Analytics
            </Link>
          </nav>
          
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <Link
              to="/"
              className="flex items-center text-sm text-gray-400 hover:text-white"
              onClick={closeSidebar}
            >
              Back to Main Site
            </Link>
          </div>
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" 
            onClick={closeSidebar}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
