import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaDownload, FaSearch, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { formatPrice } from '../../../utils/formatUtils';
import { exportToCSV } from '../components/AnalyticsUtils';
import Pagination from '../../../Components/Pagination';

const InventoryTab = ({ inventoryItems, summary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState([]);
  const [paginatedItems, setPaginatedItems] = useState([]);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    let filtered = [...inventoryItems];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCategory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, inventoryItems]);
  
  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedItems(filteredItems.slice(startIndex, endIndex));
  }, [currentPage, filteredItems]);

  // Export filtered items
  const handleExport = () => {
    exportToCSV(filteredItems, `inventory-${typeFilter}`);
  };

  // Get counts for each type
  const foodCount = inventoryItems.filter(item => item.type === 'food').length;
  const drinkCount = inventoryItems.filter(item => item.type === 'drink').length;
  const totalItems = inventoryItems.length;
  const lowStockCount = inventoryItems.filter(item => parseInt(item.quantity) <= 10).length;

  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockCurrentPage, setLowStockCurrentPage] = useState(1);
  const [paginatedLowStockItems, setPaginatedLowStockItems] = useState([]);
  const LOW_STOCK_ITEMS_PER_PAGE = 5;

  // Filter low stock items
  useEffect(() => {
    setLowStockItems(inventoryItems.filter(item => parseInt(item.quantity) <= 10));
  }, [inventoryItems]);

  // Apply pagination to low stock items
  useEffect(() => {
    const startIndex = (lowStockCurrentPage - 1) * LOW_STOCK_ITEMS_PER_PAGE;
    const endIndex = startIndex + LOW_STOCK_ITEMS_PER_PAGE;
    setPaginatedLowStockItems(lowStockItems.slice(startIndex, endIndex));
  }, [lowStockCurrentPage, lowStockItems]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <FaBoxOpen className="mr-2 text-yellow-600" /> Inventory Management
          </h2>
          <div className="mt-2 md:mt-0">
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
            >
              <FaDownload className="mr-2" /> Export Data
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-sm font-medium text-blue-800">Total Items</p>
            <h3 className="text-2xl font-bold text-blue-900">{totalItems}</h3>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center">
            <p className="text-sm font-medium text-yellow-800">Food Items</p>
            <h3 className="text-2xl font-bold text-yellow-900">{foodCount}</h3>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <p className="text-sm font-medium text-green-800">Drink Items</p>
            <h3 className="text-2xl font-bold text-green-900">{drinkCount}</h3>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            <p className="text-sm font-medium text-red-800">Low Stock</p>
            <h3 className="text-2xl font-bold text-red-900">{lowStockCount}</h3>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center">
              <FaSearch className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              >
                <option value="all">All Items</option>
                <option value="food">Food Only</option>
                <option value="drink">Drinks Only</option>
              </select>
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.type === 'food' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type === 'food' ? 'Food' : 'Drink'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.itemCategory}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${parseInt(item.quantity) === 0 
                            ? 'bg-red-100 text-red-800' 
                            : parseInt(item.quantity) <= 5 
                              ? 'bg-yellow-100 text-yellow-800'
                              : parseInt(item.quantity) <= 10
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'}`}
                        >
                          {parseInt(item.quantity) === 0 
                            ? 'Out of Stock' 
                            : parseInt(item.quantity) <= 5 
                              ? 'Critical' 
                              : parseInt(item.quantity) <= 10
                                ? 'Low'
                                : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalItems={filteredItems.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No inventory items match your search criteria
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <FaExclamationTriangle className="text-yellow-600 mr-2" /> Low Stock Items
          </h3>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} with low stock
          </div>
        </div>
        
        {lowStockItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Left
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLowStockItems.map((item) => (
                    <tr key={`low-${item._id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.type === 'food' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type === 'food' ? 'Food' : 'Drink'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${parseInt(item.quantity) === 0 
                            ? 'bg-red-100 text-red-800' 
                            : parseInt(item.quantity) <= 5 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'}`}
                        >
                          {parseInt(item.quantity) === 0 
                            ? 'Out of Stock' 
                            : parseInt(item.quantity) <= 5 
                              ? 'Critical' 
                              : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination*/}
            {lowStockItems.length > LOW_STOCK_ITEMS_PER_PAGE && (
              <div className="mt-4">
                <Pagination 
                  currentPage={lowStockCurrentPage}
                  totalItems={lowStockItems.length}
                  itemsPerPage={LOW_STOCK_ITEMS_PER_PAGE}
                  onPageChange={setLowStockCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No low stock items - inventory levels are good
          </div>
        )}
      </div>
    </>
  );
};

export default InventoryTab;
