import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaSpinner, FaSearch, FaPlus, FaGlassMartini, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import { formatPrice } from '../../utils/formatUtils';
import Pagination from '../../Components/Pagination';

const StaffDrinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortField, setSortField] = useState('drinkName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/drinks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drinks');
      }

      const data = await response.json();
      setDrinks(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(drink => drink.drinkCategory).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      setError(error.message || 'Error fetching drinks');
      toast.error(error.message || 'Error fetching drinks');
    } finally {
      setLoading(false);
    }
  };
  
  const getSortedAndFilteredDrinks = () => {
    let filteredDrinks = drinks.filter(drink => {
      const matchesSearch = drink.drinkName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            drink.drinkDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter ? drink.drinkCategory === categoryFilter : true;
      
      return matchesSearch && matchesCategory;
    });
    
    return filteredDrinks.sort((a, b) => {
      if (['drinkPrice', 'drinkQuantity', 'orderCount'].includes(sortField)) {
        const valueA = parseFloat(a[sortField]) || 0;
        const valueB = parseFloat(b[sortField]) || 0;
        
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = (a[sortField] || '').toLowerCase();
        const valueB = (b[sortField] || '').toLowerCase();
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
  };
  
  const sortedAndFilteredDrinks = getSortedAndFilteredDrinks();
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrinks = sortedAndFilteredDrinks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredDrinks.length / itemsPerPage);
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <FaArrowUp className="ml-1 inline" />
    ) : (
      <FaArrowDown className="ml-1 inline" />
    );
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortField('drinkName');
    setSortDirection('asc');
    setCurrentPage(1);
  };
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  return (
    <>
      <Helmet>
        <title>Staff | Drink Management</title>
      </Helmet>
      
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Drink Management</h1>
          <div className="flex space-x-2">
            <Link
              to="/addDrink"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center"
            >
              <FaPlus className="mr-2" /> Add New Drink
            </Link>
            
            <button
              onClick={resetFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search drinks by name or description..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="w-full md:w-auto">
              <select
                className="w-full md:w-64 border rounded-lg px-4 py-2 bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Drink Items List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 my-8">
            {error}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('drinkName')}
                    >
                      Drink Name <SortIcon field="drinkName" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('drinkCategory')}
                    >
                      Category <SortIcon field="drinkCategory" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('drinkPrice')}
                    >
                      Price <SortIcon field="drinkPrice" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('drinkQuantity')}
                    >
                      Stock <SortIcon field="drinkQuantity" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('orderCount')}
                    >
                      Orders <SortIcon field="orderCount" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDrinks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No drink items found.
                      </td>
                    </tr>
                  ) : (
                    currentDrinks.map((drink) => (
                      <tr key={drink._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{drink.drinkName}</div>
                          {drink.drinkDescription && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{drink.drinkDescription}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {drink.drinkCategory || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(drink.drinkPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${parseInt(drink.drinkQuantity) <= 5 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {drink.drinkQuantity}
                          </div>
                          {parseInt(drink.drinkQuantity) <= 5 && (
                            <span className="text-xs text-red-600">Low stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {drink.orderCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {drink.drinkImage ? (
                            <img 
                              src={drink.drinkImage} 
                              alt={drink.drinkName}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <FaGlassMartini className="text-gray-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/seeDrink/${drink._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Desktop pagination*/}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(indexOfLastItem, sortedAndFilteredDrinks.length)}</span> of{" "}
                        <span className="font-medium">{sortedAndFilteredDrinks.length}</span> results
                      </p>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalItems={sortedAndFilteredDrinks.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={paginate}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {currentDrinks.length === 0 ? (
                <div className="bg-white p-4 text-center text-gray-500 rounded-lg shadow">
                  No drink items found
                </div>
              ) : (
                currentDrinks.map((drink) => (
                  <div key={drink._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex p-4">
                      <div className="mr-4">
                        {drink.drinkImage ? (
                          <img 
                            src={drink.drinkImage} 
                            alt={drink.drinkName}
                            className="h-20 w-20 object-cover rounded"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                            <FaGlassMartini className="text-gray-500 text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{drink.drinkName}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{drink.drinkDescription}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-medium text-gray-900">{formatPrice(drink.drinkPrice)}</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {drink.drinkCategory || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className={`font-medium ${parseInt(drink.drinkQuantity) <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                            {drink.drinkQuantity}
                          </span>
                          <span className="text-gray-500 ml-1">in stock</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{drink.orderCount || 0}</span>
                          <span className="text-gray-500 ml-1">orders</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/seeDrink/${drink._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Mobile pagination*/}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={sortedAndFilteredDrinks.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={paginate}
                  maxPagesToShow={3}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StaffDrinks;