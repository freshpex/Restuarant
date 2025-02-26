import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFood } from '../../redux/slices/foodActionsSlice';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const AddFood = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector(state => state.auth);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUsingUrl, setIsUsingUrl] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                <title>Chef | Add-Food</title>
            </Helmet>
            {/* <Header2 /> */}
            <div className='bg-[#121212] lg:px-20 px-6 w-full py-44 flex flex-col justify-center items-center'>
                <section className="w-full lg:w-[38%] rounded-lg px-4 py-4 mx-auto lg:pb-10 bg-[#F4F3F0]">
                    <div className="py-8 px-4 mx-auto w-full lg:py-2">
                        <h2 className="mb-16 text-2xl text-center font-bold text-gray-900">Add a Food Item</h2>
                        
                        <form className='w-full' onSubmit={handleAddFood}>
                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                                <div className="w-full">
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                                    <input 
                                        defaultValue={user.displayName} 
                                        type="text" 
                                        name="name" 
                                        id="name" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter brand name" 
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                                    <input 
                                        defaultValue={user.email} 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter email" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="w-full">
                                    <label htmlFor="food" className="block mb-2 text-sm font-medium text-gray-900">Food Name</label>
                                    <input 
                                        type="text" 
                                        name="food" 
                                        id="food" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter food name" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">Price</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        id="price" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter food price" 
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Short Description</label>
                                    <input 
                                        type="text" 
                                        name="description" 
                                        id="description" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter description" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">Food Category</label>
                                    <input 
                                        type="text" 
                                        name="category" 
                                        id="category" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter food category" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Image input with toggle between URL and file upload */}
                                <div className="w-full sm:col-span-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-900">Food Image</label>
                                        <button 
                                            type="button"
                                            onClick={handleToggleUploadMethod}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                            disabled={isSubmitting}
                                        >
                                            {isUsingUrl ? 'Switch to file upload' : 'Use image URL instead'}
                                        </button>
                                    </div>

                                    {isUsingUrl ? (
                                        <input 
                                            type="text" 
                                            name="image" 
                                            id="image" 
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                            placeholder="Enter food image URL" 
                                            required={isUsingUrl}
                                            disabled={isSubmitting}
                                        />
                                    ) : (
                                        <>
                                            <input 
                                                type="file" 
                                                name="imageFile" 
                                                id="imageFile" 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                required={!isUsingUrl}
                                                disabled={isSubmitting}
                                            />
                                            {previewUrl && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Food preview" 
                                                        className="h-32 w-auto object-cover rounded-lg" 
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="origin" className="block mb-2 text-sm font-medium text-gray-900">Food Origin</label>
                                    <input 
                                        type="text" 
                                        name="origin" 
                                        id="origin" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter food origin" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Food Quantity</label>
                                    <input 
                                        type='number' 
                                        name='quantity'
                                        id="quantity"
                                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                        placeholder="Enter food quantity" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            
                            {/* Submit button with loading spinner */}
                            <button 
                                type="submit" 
                                className={`flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-800'}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Add Food Item'
                                )}
                            </button>
                            
                            {isSubmitting && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                                    </div>
                                    <p className="text-xs text-center mt-1 text-gray-500">
                                        Your image is being uploaded. Please wait...
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AddFood;