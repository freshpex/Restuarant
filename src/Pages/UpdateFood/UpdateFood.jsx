import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateFood, clearSuccess, clearError, fetchFoodForUpdate, clearFoodForUpdate } from '../../redux/slices/foodActionsSlice';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import { FaUserShield, FaSpinner } from 'react-icons/fa';
import { selectIsAdmin } from '../../redux/selectors';

const UpdateFood = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const isAdmin = useSelector(selectIsAdmin);
    const token = localStorage.getItem('token');
    const { loading, error, success, foodForUpdate } = useSelector(state => state.foodActions);
    
    // New state variables for image handling
    const [isEditingAsAdmin, setIsEditingAsAdmin] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUsingUrl, setIsUsingUrl] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id && token) {
            dispatch(fetchFoodForUpdate({ id, token }))
                .unwrap()
                .then(food => {
                    if (food.email !== user.email && isAdmin) {
                        setIsEditingAsAdmin(true);
                        toast.info('You are editing this food as an admin');
                    }
                    
                    if (food.foodImage) {
                        setPreviewUrl(food.foodImage);
                    }
                })
                .catch(error => {
                    console.error("Error fetching food:", error);
                    if (error.includes("Unauthorized")) {
                        toast.error("You don't have permission to edit this food");
                        navigate('/food');
                    }
                });
        }
        
        return () => {
            dispatch(clearFoodForUpdate());
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [dispatch, id, token, user?.email, isAdmin, navigate]);

    useEffect(() => {
        if (success) {
            toast.success("Food updated successfully");
            dispatch(clearSuccess());
            navigate('/myFood');
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [success, error, dispatch, navigate]);

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setIsUsingUrl(false);
        }
    };

    // Handle switching between URL and file upload
    const handleToggleUploadMethod = () => {
        setIsUsingUrl(!isUsingUrl);
        if (!isUsingUrl) {
            setImageFile(null);
            if (foodForUpdate?.foodImage) {
                setPreviewUrl(foodForUpdate.foodImage);
            } else {
                setPreviewUrl('');
            }
        }
    };

    const handleUpdateFood = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const form = e.target;
        const updatedFood = {
            buyerName: user.displayName,
            email: user.email,
            foodName: form.food.value,
            foodPrice: form.price.value,
            foodCategory: form.category.value,
            foodDescription: form.description.value,
            foodOrigin: form.origin.value,
            foodQuantity: form.quantity.value,
        };

        if (isUsingUrl) {
            updatedFood.foodImage = form.image.value;
            dispatch(updateFood({ id, foodData: updatedFood, token }));
        } else {
            try {
                await dispatch(updateFood({ 
                    id, 
                    foodData: updatedFood, 
                    token,
                    imageFile
                })).unwrap();
            } catch (error) {
                console.error('Error updating food with image:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!foodForUpdate) return <div className="text-center py-10 text-white bg-[#121212]">Loading food details...</div>;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Update-Food</title>
            </Helmet>
            { loading && <div> <LoadingSpinner /></div>}
            <div className='bg-[#121212] lg:px-20 px-6 w-full py-44 flex flex-col justify-center items-center'>
                <section className="w-full lg:w-[38%] rounded-lg px-4 py-4 mx-auto lg:pb-10 bg-[#F4F3F0]">
                    <div className="py-8 px-4 mx-auto w-full lg:py-2">
                        <h2 className="mb-6 text-2xl text-center font-bold text-gray-900">
                            Update Food Item
                        </h2>
                        
                        {isEditingAsAdmin && (
                            <div className="mb-6 p-3 bg-blue-100 text-blue-800 rounded-md flex items-center">
                                <FaUserShield className="mr-2" />
                                <span>You are editing this food as an admin. Original creator: {foodForUpdate?.email}</span>
                            </div>
                        )}
                        
                        <form className='w-full' onSubmit={handleUpdateFood}>
                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                                <div className="w-full">
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                                    <input defaultValue={user.displayName} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter name" required disabled={isSubmitting}/>
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                                    <input defaultValue={user.email} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter email" required disabled={isSubmitting} />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="food" className="block mb-2 text-sm font-medium text-gray-900">Food Name*</label>
                                    <input defaultValue={foodForUpdate.foodName} type="text" name="food" id="food" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter food name" required disabled={isSubmitting} />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">Price*</label>
                                    <input defaultValue={foodForUpdate.foodPrice} type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter food price" required disabled={isSubmitting}/>
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Short Description</label>
                                    <input defaultValue={foodForUpdate.foodDescription} type="text" name="description" id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter description (optional)" disabled={isSubmitting} />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">Food Category</label>
                                    <input defaultValue={foodForUpdate.foodCategory} type="text" name="category" id="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter food category (optional)" disabled={isSubmitting} />
                                </div>
                                
                                {/* New image upload section with toggle */}
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
                                            defaultValue={foodForUpdate.foodImage} 
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
                                                required={!previewUrl}
                                                disabled={isSubmitting}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Choose a new image file to update the current image.</p>
                                        </>
                                    )}
                                    
                                    {previewUrl && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-900 mb-2">Image Preview:</p>
                                            <img 
                                                src={previewUrl} 
                                                alt="Food preview" 
                                                className="h-48 w-full object-cover rounded-lg border border-gray-300" 
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="origin" className="block mb-2 text-sm font-medium text-gray-900">Food Origin</label>
                                    <input defaultValue={foodForUpdate.foodOrigin} type="text" name="origin" id="origin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter food origin (optional)" disabled={isSubmitting} />
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Food Quantity*</label>
                                    <input defaultValue={foodForUpdate.foodQuantity} type='number' name='quantity' id="quantity" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500" placeholder="Enter food quantity" required disabled={isSubmitting} />
                                </div>
                            </div>
                            
                            {/* Submit button with loading spinner */}
                            <button 
                                type="submit" 
                                disabled={isSubmitting || loading}
                                className="flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                            >
                                {isSubmitting || loading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Food'
                                )}
                            </button>
                            
                            {isSubmitting && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                                    </div>
                                    <p className="text-xs text-center mt-1 text-gray-500">
                                        {imageFile ? 'Uploading image and updating food...' : 'Updating food...'}
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

export default UpdateFood;