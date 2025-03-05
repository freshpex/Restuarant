import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaSpinner, 
  FaEllipsisV, FaExclamationTriangle, FaFilter 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import { Link, NavLink } from 'react-router-dom';

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [filterLowStock, setFilterLowStock] = useState(false);
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch foods');
      }

      const data = await response.json();
      setFoods(data.foods || []);
      
      const uniqueCategories = [...new Set(data.foods.map(food => food.foodCategory))];
      setCategories(uniqueCategories);
    } catch (error) {
      setError(error.message || 'Error fetching foods');
      toast.error(error.message || 'Error fetching foods');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`${API_URL}/admin/foods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete food');
      }

      toast.success('Food deleted successfully');
      setFoods(foods.filter(food => food._id !== id));
    } catch (error) {
      toast.error(error.message || 'Error deleting food');
    } finally {
      setDeleting(false);
    }
  };

  // Filter foods based on search term, category, and low stock filter
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        food.foodDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category ? food.foodCategory === category : true;
    const matchesLowStock = filterLowStock ? 
                          (Number(food.foodQuantity) <= 5) : true;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFoods.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleActionMenu = (id) => {
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const getStockStatus = (quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) return { status: 'out', text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (qty <= 5) return { status: 'low', text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'normal', text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <>
      <Helmet>
        <title>Admin | Food Management</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Food Management</h1>
          <Link 
            to="/addFood"
            className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-2 flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Food
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search foods..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            className="border rounded-lg px-4 py-2 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Add Low Stock filter button */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-4 py-2 rounded-lg flex items-center text-sm ${
              filterLowStock 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaFilter className="mr-2" /> Low Stock
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            {error}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {currentItems.length === 0 ? (
                <div className="bg-white p-4 text-center text-gray-500 rounded-lg shadow">
                  No food items found
                </div>
              ) : (
                currentItems.map((food) => {
                  const stockStatus = getStockStatus(food.foodQuantity);
                  return (
                    <div key={food._id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex items-center">
                        <img 
                          src={food.foodImage}
                          alt={food.foodName}
                          className="h-16 w-16 object-cover rounded mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{food.foodName}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600">₦{food.foodPrice}</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {food.foodCategory}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">Orders: {food.orderCount || 0}</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${stockStatus.color}`}>
                              {stockStatus.status !== 'normal' && <FaExclamationTriangle className="mr-1" />}
                              {food.foodQuantity || 0} left
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                        <Link 
                          to={`/seeFood/${food._id}`}
                          className="flex-1 flex justify-center items-center py-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FaEye className="mr-2" /> View
                        </Link>
                        <NavLink 
                          to={`/admin/update/${food._id}`}
                          className="flex-1 flex justify-center items-center py-2 text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </NavLink>
                        <button
                          onClick={() => handleDelete(food._id)}
                          disabled={deleting}
                          className="flex-1 flex justify-center items-center py-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FaTrash className="mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Mobile pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded ${
                      currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Prev
                  </button>
                  <span className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded ${
                      currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No food items found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((food) => {
                      const stockStatus = getStockStatus(food.foodQuantity);
                      return (
                        <tr key={food._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-12 w-12">
                              <img 
                                src={food.foodImage} 
                                alt={food.foodName}
                                className="h-12 w-12 object-cover rounded"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{food.foodName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {food.foodCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">₦{food.foodPrice}</div>
                          </td>
                          {/* Add Quantity cell with stock status */}
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                              {stockStatus.status !== 'normal' && <FaExclamationTriangle className="mr-1" />}
                              {food.foodQuantity || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{food.orderCount || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link 
                                to={`/seeFood/${food._id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <FaEye />
                              </Link>
                              <Link 
                                to={`/admin/update-food/${food._id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() => handleDelete(food._id)}
                                disabled={deleting}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-white flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredFoods.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredFoods.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === i + 1
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FoodManagement;
