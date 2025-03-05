import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaUsers, FaUtensils, FaChartLine, FaShoppingCart, 
  FaTachometerAlt, FaBars, FaTimes, FaSignOutAlt,
  FaUserClock, FaHome, FaShieldAlt, FaWarehouse, FaPlus, FaGlassMartini, FaDrumstickBite
} from 'react-icons/fa';
import { selectCurrentUser } from '../../redux/selectors';
import Logo from "../../assets/Logo.png";

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  
  // Close sidebar when clicking outside of it or navigating
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

    // Close sidebar when route changes (for mobile)
    setSidebarOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.pathname]);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Tim's Kitchen</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Tim's Kitchen" className="h-10 w-10" />
            <span className="ml-2 text-xl font-bold">Admin Panel</span>
          </Link>
          
          <button 
            ref={toggleButtonRef}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-md"
          >
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Fixed on larger screens, sliding on mobile */}
          <aside 
            ref={sidebarRef}
            className={`bg-gray-900 text-gray-300 shadow-lg fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } overflow-y-auto`}
          >
            {/* Logo section - Only visible on desktop */}
            <div className="hidden md:flex items-center justify-center h-20 bg-gray-800 border-b border-gray-700">
              <Link to="/" className="flex items-center">
                <img src={Logo} alt="Tim's Kitchen" className="h-14 w-14" />
                <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
              </Link>
            </div>
            
            {/* Admin info */}
            <div className="p-4">
              <div className="bg-yellow-900 bg-opacity-20 p-4 rounded-lg flex items-center mb-6">
                <div className="text-yellow-500 mr-3 text-xl">
                  <FaShieldAlt />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-200">Administrator</p>
                  <p className="text-xs text-gray-400">{currentUser?.email || 'Not logged in'}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <NavLink 
                  to="/admin" 
                  end
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTachometerAlt className="mr-3" />
                  Dashboard
                </NavLink>
                
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaUsers className="mr-3" />
                  User Management
                </NavLink>
                
                <NavLink 
                  to="/admin/foods" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaUtensils className="mr-3" />
                  Food Management
                </NavLink>
                
                <NavLink 
                  to="/admin/orders" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaShoppingCart className="mr-3" />
                  Orders
                </NavLink>

                <NavLink 
                  to="/admin/add-order" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaPlus className="mr-3" />
                  Add Orders
                </NavLink>

                <NavLink 
                  to="/admin/addFood" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaDrumstickBite className="mr-3" />
                  Add Food
                </NavLink>

                <NavLink 
                  to="/admin/addDrink" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaGlassMartini className="mr-3" />
                  Add Drink
                </NavLink>
                
                <NavLink 
                  to="/admin/analytics" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaChartLine className="mr-3" />
                  Analytics
                </NavLink>
                
                <NavLink 
                  to="/admin/staff-activities" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaUserClock className="mr-3" />
                  Staff Activities
                </NavLink>

                <NavLink 
                  to="/admin/material" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 text-sm rounded-lg ${
                      isActive 
                        ? 'bg-yellow-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaWarehouse className="mr-3" />
                  Material Management
                </NavLink>

                <div className="pt-4 mt-4 border-t border-gray-700">
                  <Link
                    to="/"
                    className="flex items-center px-4 py-3 text-sm rounded-lg text-gray-300 hover:bg-gray-800"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FaHome className="mr-3" />
                    Return to Home
                  </Link>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center px-4 py-3 text-sm rounded-lg text-red-300 hover:bg-red-900 hover:bg-opacity-30"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Exit Admin Panel
                  </button>
                </div>
              </nav>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
