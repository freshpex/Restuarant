import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFood } from '../../redux/slices/foodActionsSlice';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { FaSpinner, FaImage, FaUpload, FaLink, FaImages } from 'react-icons/fa';

const AddFood = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector(state => state.auth);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUsingUrl, setIsUsingUrl] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageHovered, setIsImageHovered] = useState(false);

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsUsingUrl(false);
        }
    };

    // Handle switching between URL and file upload
    const handleToggleUploadMethod = () => {
        setIsUsingUrl(!isUsingUrl);
        if (!isUsingUrl) {
            setImageFile(null);
            setPreviewUrl('');
        }
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        const form = e.target;

        // Validate image is provided either as file or URL
        if (!imageFile && !form.image?.value && !isUsingUrl) {
            toast.error('Please provide a food image');
            return;
        }

        // Set loading state to true
        setIsSubmitting(true);

        const foodData = {
            buyerName: user.displayName,
            email: user.email,
            foodName: form.food.value,
            foodPrice: form.price.value,
            foodCategory: form.category.value,
            foodDescription: form.description.value,
            foodOrigin: form.origin.value,
            foodQuantity: form.quantity.value,
        };

        // If using URL instead of file upload
        if (isUsingUrl) {
            foodData.foodImage = form.image.value;
        }

        try {
            await dispatch(addFood({ foodData, token, imageFile: isUsingUrl ? null : imageFile })).unwrap();
            toast.success('Food added successfully');
            form.reset();
            setImageFile(null);
            setPreviewUrl('');
        } catch (error) {
            toast.error(error || 'Failed to add food');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Add Food</title>
            </Helmet>
            
            <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        {/* Header */}
                        <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-8">
                            <h1 className="text-3xl font-bold text-gray-800 text-center">Add New Food Item</h1>
                            <p className="text-center mt-2 text-gray-600">Enter the details below to add a new food item to the menu</p>
                        </div>
                        
                        <form onSubmit={handleAddFood} className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Info Section */}
                                <div className="space-y-6 col-span-full md:col-span-1">
                                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">User Information</h2>
                                    
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                        <input 
                                            defaultValue={user.displayName} 
                                            type="text" 
                                            name="name" 
                                            id="name" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 disabled:bg-gray-50 disabled:text-gray-500" 
                                            placeholder="Enter name" 
                                            required
                                            disabled={isSubmitting || true}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input 
                                            defaultValue={user.email} 
                                            type="email" 
                                            name="email" 
                                            id="email" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 disabled:bg-gray-50 disabled:text-gray-500" 
                                            placeholder="Enter email" 
                                            required 
                                            disabled={isSubmitting || true}
                                        />
                                    </div>
                                </div>

                                {/* Image Upload Section */}
                                <div className="space-y-6 col-span-full md:col-span-1">
                                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Food Image</h2>
                                    
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-2">
                                            <FaImages className="text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Upload Food Image</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleToggleUploadMethod}
                                            className="text-xs text-blue-600 hover:text-blue-800 transition duration-150 flex items-center"
                                            disabled={isSubmitting}
                                        >
                                            {isUsingUrl ? (
                                                <>
                                                    <FaUpload className="mr-1" />
                                                    Switch to file upload
                                                </>
                                            ) : (
                                                <>
                                                    <FaLink className="mr-1" />
                                                    Use image URL instead
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {isUsingUrl ? (
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLink className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="image" 
                                                id="image" 
                                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="https://example.com/image.jpg" 
                                                required={isUsingUrl}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <label 
                                                htmlFor="imageFile" 
                                                className={`flex flex-col items-center justify-center w-full h-40 border-2 ${imageFile ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 border-dashed bg-gray-50'} rounded-lg cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onMouseEnter={() => setIsImageHovered(true)}
                                                onMouseLeave={() => setIsImageHovered(false)}
                                            >
                                                {!previewUrl ? (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-3">
                                                        <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-500 text-center">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 text-center">PNG, JPG or WEBP (MAX. 2MB)</p>
                                                    </div>
                                                ) : (
                                                    <div className="relative w-full h-full">
                                                        <img 
                                                            src={previewUrl} 
                                                            alt="Food preview" 
                                                            className="h-full w-full object-contain p-2" 
                                                        />
                                                        {isImageHovered && (
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
                                                                <p className="text-white text-sm font-medium">Change Image</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    name="imageFile" 
                                                    id="imageFile" 
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    required={!isUsingUrl && !previewUrl}
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                            <p className="mt-2 text-xs text-gray-500">
                                                {previewUrl ? "Click the image to change it" : ""}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Food Details Section */}
                                <div className="col-span-full border-t pt-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Food Details</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="food" className="block text-sm font-medium text-gray-700">Food Name*</label>
                                            <input 
                                                type="text" 
                                                name="food" 
                                                id="food" 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="e.g. Grilled Chicken Sandwich" 
                                                required 
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₦)*</label>
                                            <input 
                                                type="number" 
                                                name="price" 
                                                id="price" 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="e.g. 1500" 
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                            <input 
                                                type="text" 
                                                name="category" 
                                                id="category" 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="e.g. Sandwiches, Rice Dishes" 
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
                                            <input 
                                                type="text" 
                                                name="origin" 
                                                id="origin" 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="e.g. Italian, Nigerian" 
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        <div className="col-span-2">
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea 
                                                name="description" 
                                                id="description" 
                                                rows="2"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="Brief description of this food item" 
                                                disabled={isSubmitting}
                                            ></textarea>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Available Quantity*</label>
                                            <input 
                                                type='number' 
                                                name='quantity'
                                                id="quantity"
                                                min="0"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" 
                                                placeholder="e.g. 20" 
                                                required 
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Submit Button */}
                            <div className="pt-5 border-t border-gray-200">
                                <div className="flex justify-end space-x-3">
                                    <button 
                                        type="button" 
                                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        onClick={() => window.history.back()}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`inline-flex justify-center items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                Adding Food...
                                            </>
                                        ) : (
                                            'Add Food Item'
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Progress indicator */}
                            {isSubmitting && (
                                <div className="mt-6">
                                    <div className="relative pt-1">
                                        <div className="overflow-hidden h-2 text-xs flex rounded bg-yellow-200">
                                            <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500 w-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-gray-500 mt-2">
                                        Please wait while we upload your food image and save the information...
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddFood;