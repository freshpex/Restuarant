import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaPlus, FaSearch, FaSpinner, FaExclamationTriangle, 
  FaFilter, FaDownload, FaBoxOpen 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken, selectCurrentUser } from '../../redux/selectors';

import MaterialsTable from '../../Components/RawMaterials/MaterialsTable';
import MaterialForm from '../../Components/RawMaterials/MaterialForm';
import Modal from '../../Components/Common/Modal';
import ConfirmationModal from '../../Components/Common/ConfirmationModal';

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterLowStock, setFilterLowStock] = useState(false);
  
  const [formValues, setFormValues] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    supplier: '',
    cost: '',
    description: '',
    minStockLevel: ''
  });

  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const API_URL = import.meta.env.VITE_API_URL;
  
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isChef = currentUser?.role === 'chef';
  
  const hasAccess = isAdmin || isManager || isChef;
  const canEditDelete = isAdmin;

  useEffect(() => {
    if (hasAccess) {
      fetchMaterials();
    }
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/raw-materials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch raw materials');
      }

      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError(error.message || 'Error fetching materials');
      toast.error('Failed to load raw materials data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      quantity: '',
      unit: 'kg',
      supplier: '',
      cost: '',
      description: '',
      minStockLevel: ''
    });
    setEditingMaterial(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (material) => {
    setFormValues({
      name: material.name,
      quantity: material.quantity.toString(),
      unit: material.unit,
      supplier: material.supplier || '',
      cost: material.cost ? material.cost.toString() : '',
      description: material.description || '',
      minStockLevel: material.minStockLevel ? material.minStockLevel.toString() : ''
    });
    setEditingMaterial(material);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formValues.name || !formValues.quantity || !formValues.unit) {
      toast.error('Name, quantity, and unit are required');
      return;
    }
    
    try {
      if (editingMaterial) {
        // Update existing material
        const response = await fetch(`${API_URL}/staff/raw-materials/${editingMaterial._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update raw material');
        }
        
        toast.success('Raw material updated successfully');
        
        setMaterials(materials.map(mat => 
          mat._id === editingMaterial._id ? { 
            ...mat, 
            ...formValues,
            quantity: parseFloat(formValues.quantity),
            cost: parseFloat(formValues.cost) || 0,
            minStockLevel: parseFloat(formValues.minStockLevel) || 0,
            updatedAt: new Date()
          } : mat
        ));
      } else {
        const response = await fetch(`${API_URL}/staff/raw-materials`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        });
        
        if (!response.ok) {
          throw new Error('Failed to add raw material');
        }
        
        const data = await response.json();
        
        toast.success('Raw material added successfully');
        
        setMaterials([...materials, data.material]);
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(error.message || 'Error saving raw material');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      const response = await fetch(`${API_URL}/staff/raw-materials/${deleteConfirmation._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete raw material');
      }
      
      toast.success('Raw material deleted successfully');
      
      setMaterials(materials.filter(mat => mat._id !== deleteConfirmation._id));
      
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error(error.message || 'Error deleting raw material');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMaterials = materials
    .filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (material.supplier && material.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLowStock = filterLowStock ? 
        material.quantity <= (material.minStockLevel || 0) : true;
      
      return matchesSearch && matchesLowStock;
    })
    .sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      if (['quantity', 'cost', 'minStockLevel'].includes(sortField)) {
        fieldA = parseFloat(fieldA) || 0;
        fieldB = parseFloat(fieldB) || 0;
      } else if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Export to CSV
  const exportToCSV = () => {
    if (materials.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['Name', 'Quantity', 'Unit', 'Supplier', 'Cost', 'Min Stock Level', 'Description'];
    const rows = materials.map(material => [
      material.name,
      material.quantity,
      material.unit,
      material.supplier || '',
      material.cost || '0',
      material.minStockLevel || '0',
      material.description || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'raw_materials.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 p-4 rounded-md text-red-700 flex items-center">
          <FaExclamationTriangle className="text-xl mr-2" />
          <div>
            <h2 className="text-lg font-bold mb-1">Access Restricted</h2>
            <p>You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Raw Materials | Tim's Kitchen</title>
      </Helmet>
      
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Raw Materials Inventory</h1>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Search materials..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
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
            
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <FaDownload className="mr-2" /> Export
            </button>
            
            <button
              onClick={openAddModal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <FaPlus className="mr-2" /> Add Material
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <MaterialsTable
              materials={filteredAndSortedMaterials}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              onEdit={openEditModal}
              onDelete={setDeleteConfirmation}
              canEditDelete={canEditDelete}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        title={editingMaterial ? 'Edit Raw Material' : 'Add Raw Material'}
        onClose={() => setShowAddModal(false)}
      >
        <MaterialForm
          formValues={formValues}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => setShowAddModal(false)}
          isEditing={!!editingMaterial}
        />
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteConfirmation?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmation(null)}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default RawMaterials;