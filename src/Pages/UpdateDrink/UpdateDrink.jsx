import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateDrink, clearSuccess, clearError, fetchDrinkForUpdate, clearDrinkForUpdate } from '../../redux/slices/drinkActionsSlice';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import { FaUserShield, FaSpinner } from 'react-icons/fa';
import { selectIsAdmin } from '../../redux/selectors';

const UpdateDrink = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const isAdmin = useSelector(selectIsAdmin);
    const token = localStorage.getItem('token');
    const { loading, error, success, drinkForUpdate: drinkForUpdate } = useSelector(state => state.drinkActions);
    
    // New state variables for image handling
    const [isEditingAsAdmin, setIsEditingAsAdmin] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUsingUrl, setIsUsingUrl] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id && token) {
            dispatch(fetchDrinkForUpdate({ id, token }))
                .unwrap()
                .then(drink => {
                    if (drink.email !== user.email && isAdmin) {
                        setIsEditingAsAdmin(true);
                        toast.info('You are editing this drink as an admin');
                    }
                    
                    if (drink.drinkImage) {
                        setPreviewUrl(drink.drinkImage);
                    }
                })
                .catch(error => {
                    console.error("Error fetching drink:", error);
                    if (error.includes("Unauthorized")) {
                        toast.error("You don't have permission to edit this drink");
                        navigate('/drink');
                    }
                });
        }
        
        return () => {
            dispatch(clearDrinkForUpdate());
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [dispatch, id, token, user?.email, isAdmin, navigate]);

    useEffect(() => {
        if (success) {
            toast.success("Drink updated successfully");
            dispatch(clearSuccess());
            navigate('/myDrink');
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
            if (drinkForUpdate?.drinkImage) {
                setPreviewUrl(drinkForUpdate.drinkImage);
            } else {
                setPreviewUrl('');
            }
        }
    };

    const handleUpdateDrink = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const form = e.target;
        const updatedDrink = {
            buyerName: user.displayName,
            email: user.email,
            drinkName: form.drink.value,
            drinkPrice: form.price.value,
            drinkCategory: form.category.value,
            drinkDescription: form.description.value,
            drinkOrigin: form.origin.value,
            drinkQuantity: form.quantity.value,
        };

        if (isUsingUrl) {
            updatedDrink.drinkImage = form.image.value;
            dispatch(updateDrink({ id, drinkData: updatedDrink, token }));
        } else {
            try {
                await dispatch(updateDrink({ 
                    id, 
                    drinkData: updatedDrink, 
                    token,
                    imageFile
                })).unwrap();
            } catch (error) {
                console.error('Error updating drink with image:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!drinkForUpdate) return <div className="text-center py-10 text-white bg-[#121212]">Loading drink details...</div>;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Update-Drink</title>
            </Helmet>
            { loading && <div> <LoadingSpinner /></div>}
            <div className='bg-[#121212] lg:px-20 px-6 w-full py-44 flex flex-col justify-center items-center'>
                <section className="w-full lg:w-[38%] rounded-lg px-4 py-4 mx-auto lg:pb-10 bg-[#F4F3F0]">
                    <div className="py-8 px-4 mx-auto w-full lg:py-2">
                        <h2 className="mb-6 text-2xl text-center font-bold text-gray-900">
                            Update Drink Item
                        </h2>
                        
                        {isEditingAsAdmin && (
                            <div className="mb-6 p-3 bg-blue-100 text-blue-800 rounded-md flex items-center">
                                <FaUserShield className="mr-2" />
                                <span>You are editing this drink as an admin. Original creator: {drinkForUpdate?.email}</span>
                            </div>
                        )}
                        
                        <form className='w-full' onSubmit={handleUpdateDrink}>
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
                                    <label htmlFor="drink" className="block mb-2 text-sm font-medium text-gray-900">Drink Name*</label>
                                    <input defaultValue={drinkForUpdate.drinkName} type="text" name="drink" id="drink" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter drink name" required disabled={isSubmitting} />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">Price*</label>
                                    <input defaultValue={drinkForUpdate.drinkPrice} type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter drink price" required disabled={isSubmitting}/>
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Short Description</label>
                                    <input defaultValue={drinkForUpdate.drinkDescription} type="text" name="description" id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter description (optional)" disabled={isSubmitting} />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">Drink Category</label>
                                    <input defaultValue={drinkForUpdate.drinkCategory} type="text" name="category" id="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter drink category (optional)" disabled={isSubmitting} />
                                </div>
                                
                                {/* New image upload section with toggle */}
                                <div className="w-full sm:col-span-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-900">Drink Image</label>
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
                                            defaultValue={drinkForUpdate.drinkImage} 
                                            type="text" 
                                            name="image" 
                                            id="image" 
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                            placeholder="Enter drink image URL" 
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
                                                alt="Drink preview" 
                                                className="h-48 w-full object-cover rounded-lg border border-gray-300" 
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="origin" className="block mb-2 text-sm font-medium text-gray-900">Drink Origin</label>
                                    <input defaultValue={drinkForUpdate.drinkOrigin} type="text" name="origin" id="origin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter drink origin (optional)" disabled={isSubmitting} />
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Drink Quantity*</label>
                                    <input defaultValue={drinkForUpdate.drinkQuantity} type='number' name='quantity' id="quantity" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500" placeholder="Enter drink quantity" required disabled={isSubmitting} />
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
                                    'Update Drink'
                                )}
                            </button>
                            
                            {isSubmitting && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                                    </div>
                                    <p className="text-xs text-center mt-1 text-gray-500">
                                        {imageFile ? 'Uploading image and updating drink...' : 'Updating drink...'}
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

export default UpdateDrink;