import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { 
  FaHome, FaUtensils, FaClipboardList, FaUsers, 
  FaSignOutAlt, FaBars, FaTimes, FaChartBar, 
  FaUserCog, FaCashRegister, FaUserTie, FaUserCheck
} from 'react-icons/fa';
import { selectCurrentUser } from '../../redux/selectors';
import Logo from "../../assets/Logo.png";
import { toast } from 'react-hot-toast';

const StaffLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Get role-specific styling and icons
  const getRoleDetails = () => {
    switch (currentUser?.role) {
      case 'admin':
        return {
          icon: <FaUserCog />,
          name: 'Admin',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'manager':
        return {
          icon: <FaUserTie />,
          name: 'Manager',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'chef':
        return {
          icon: <FaUtensils />,
          name: 'Chef',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'cashier':
        return {
          icon: <FaCashRegister />,
          name: 'Cashier',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      default:
        return {
          icon: <FaUserCheck />,
          name: 'Staff',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const roleDetails = getRoleDetails();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar for larger screens */}
      <div className="bg-white shadow-lg hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <div className="flex items-center justify-center h-20 bg-gray-50">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Tim's Kitchen" className="h-14 w-14" />
            <span className="ml-2 text-xl font-bold text-gray-800">Tim's Kitchen</span>
          </Link>
        </div>
        
        <div className="p-4">
          <div className={`${roleDetails.bgColor} p-4 rounded-lg flex items-center mb-6`}>
            <div className={`${roleDetails.color} mr-3 text-xl`}>
              {roleDetails.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{roleDetails.name} Panel</p>
              <p className="text-xs text-gray-500">{currentUser?.email || 'Not logged in'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink 
              to="/staff/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaHome className="mr-3" />
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/staff/orders" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaClipboardList className="mr-3" />
              Orders
            </NavLink>
            
            <NavLink 
              to="/staff/foods" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaUtensils className="mr-3" />
              Food Items
            </NavLink>
            
            <NavLink 
              to="/staff/add-order" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaClipboardList className="mr-3" />
              Add Order
            </NavLink>
            
            <Link 
              to="/addFood"
              className="flex items-center px-4 py-3 text-sm rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <FaUtensils className="mr-3" />
              Add New Food
            </Link>

            
            <Link 
                to="/"
                className="w-full flex items-center px-4 py-2 rounded-lg text-yellow-800 hover:bg-gray-900 transition-colors"
            >
                <FaSignOutAlt className="mr-3" />
                Home
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm rounded-lg text-red-600 hover:bg-red-50"
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Tim's Kitchen" className="h-10 w-10" />
            <span className="ml-2 text-xl font-bold text-gray-800">Tim's Kitchen</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none"
          >
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {/* Mobile menu dropdown */}
        {sidebarOpen && (
          <nav className="px-4 pb-4 space-y-2">
            <div className={`${roleDetails.bgColor} p-3 rounded-lg flex items-center mb-4`}>
              <div className={`${roleDetails.color} mr-3 text-xl`}>
                {roleDetails.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{roleDetails.name} Panel</p>
                <p className="text-xs text-gray-500">{currentUser?.email || 'Not logged in'}</p>
              </div>
            </div>
            
            <NavLink 
              to="/staff/dashboard" 
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaHome className="mr-3" />
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/staff/orders" 
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaClipboardList className="mr-3" />
              Orders
            </NavLink>
            
            <NavLink 
              to="/staff/foods" 
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaUtensils className="mr-3" />
              Food Items
            </NavLink>
            
            <NavLink 
              to="/staff/add-order" 
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-yellow-100 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaClipboardList className="mr-3" />
              Add Order
            </NavLink>

            <Link 
              to="/addFood"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center px-4 py-3 text-sm rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <FaUtensils className="mr-3" />
              Add New Food
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm rounded-lg text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </nav>
        )}
      </div>
      
      {/* Main content */}
      <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
