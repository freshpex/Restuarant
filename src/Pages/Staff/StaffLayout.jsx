import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { 
  FaHome, FaUtensils, FaClipboardList, FaUsers, 
  FaSignOutAlt, FaBars, FaTimes, FaWarehouse, 
  FaUserCog, FaCashRegister, FaUserTie, FaUserCheck
} from 'react-icons/fa';
import { selectCurrentUser } from '../../redux/selectors';
import Logo from "../../assets/Logo.png";
import { toast } from 'react-hot-toast';

const StaffLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current && 
        !toggleButtonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    setSidebarOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

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
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="Tim's Kitchen" className="h-10 w-10" />
          <span className="ml-2 text-lg font-bold">Tim's Kitchen</span>
        </Link>
        
        <button 
          ref={toggleButtonRef}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside 
          ref={sidebarRef}
          className={`bg-white shadow-lg fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } overflow-y-auto`}
        >
          <div className="hidden md:flex flex-col items-center justify-center h-20 bg-gray-50">
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
                onClick={() => setSidebarOpen(false)}
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
                onClick={() => setSidebarOpen(false)}
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
                onClick={() => setSidebarOpen(false)}
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
                onClick={() => setSidebarOpen(false)}
              >
                <FaClipboardList className="mr-3" />
                Add Order
              </NavLink>
              
              <Link 
                to="/addFood"
                className="flex items-center px-4 py-3 text-sm rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <FaUtensils className="mr-3" />
                Add New Food
              </Link>

              {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                <NavLink 
                  to="/staff/material" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-100 text-yellow-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaWarehouse className="mr-3" />
                  Material Management
                </NavLink>
              )}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link
                  to="/"
                  className="flex items-center px-4 py-3 text-sm rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaHome className="mr-3" />
                  Return to Home
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm rounded-lg text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
