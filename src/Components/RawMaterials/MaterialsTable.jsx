import React from 'react';
import { 
  FaCheck, FaExclamationTriangle, FaEdit, FaTrash, 
  FaSortAmountDown, FaSortAmountUp, FaBoxOpen
} from 'react-icons/fa';
import { formatPrice } from '../../utils/formatUtils';

const MaterialsTable = ({ 
  materials, 
  sortField,
  sortDirection,
  handleSort,
  onEdit,
  onDelete,
  canEditDelete 
}) => {
  const getStockStatus = (material) => {
    if (!material.minStockLevel || material.minStockLevel <= 0) {
      return 'normal';
    }
    
    if (material.quantity <= 0) {
      return 'out';
    } else if (material.quantity <= material.minStockLevel) {
      return 'low';
    } else {
      return 'normal';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ?
                      <FaSortAmountUp className="ml-1" /> :
                      <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Quantity
                  {sortField === 'quantity' && (
                    sortDirection === 'asc' ?
                      <FaSortAmountUp className="ml-1" /> :
                      <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th
                onClick={() => handleSort('supplier')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Supplier
                  {sortField === 'supplier' && (
                    sortDirection === 'asc' ?
                      <FaSortAmountUp className="ml-1" /> :
                      <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('cost')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Cost
                  {sortField === 'cost' && (
                    sortDirection === 'asc' ?
                      <FaSortAmountUp className="ml-1" /> :
                      <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Added Date
                  {sortField === 'createdAt' && (
                    sortDirection === 'asc' ?
                      <FaSortAmountUp className="ml-1" /> :
                      <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {canEditDelete && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={canEditDelete ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FaBoxOpen className="text-4xl mb-2 text-gray-300" />
                    <p>No raw materials found</p>
                  </div>
                </td>
              </tr>
            ) : (
              materials.map((material) => {
                const stockStatus = getStockStatus(material);
                let statusColor = 'bg-green-100 text-green-800';
                let statusText = 'In Stock';
                let statusIcon = <FaCheck />;
                
                if (stockStatus === 'low') {
                  statusColor = 'bg-yellow-100 text-yellow-800';
                  statusText = 'Low Stock';
                  statusIcon = <FaExclamationTriangle />;
                } else if (stockStatus === 'out') {
                  statusColor = 'bg-red-100 text-red-800';
                  statusText = 'Out of Stock';
                  statusIcon = <FaExclamationTriangle />;
                }
                
                return (
                  <tr key={material._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{material.name}</div>
                      {material.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {material.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {material.quantity}
                      </div>
                      {material.minStockLevel > 0 && (
                        <div className="text-xs text-gray-500">
                          Min: {material.minStockLevel}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.supplier || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {material.cost ? (
                        <div className="text-sm text-gray-900">
                          {formatPrice(material.cost)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(material.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs leading-5 font-medium rounded-full flex items-center justify-center w-fit ${statusColor}`}>
                        {statusIcon}
                        <span className="ml-1">{statusText}</span>
                      </span>
                    </td>
                    {canEditDelete && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => onEdit(material)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit className="inline" /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(material)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline" /> Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;
