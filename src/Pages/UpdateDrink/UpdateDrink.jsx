import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateDrink, clearSuccess, clearError, fetchDrinkForUpdate, clearDrinkForUpdate } from '../../redux/slices/drinkActionsSlice';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { FaSpinner, FaUpload, FaLink, FaUserShield, FaGlassMartini, FaExclamationTriangle } from 'react-icons/fa';
import { selectIsAdmin } from '../../redux/selectors';

const UpdateDrink = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const isAdmin = useSelector(selectIsAdmin);
    const token = localStorage.getItem('token');
    const { loading, error, success, drinkForUpdate } = useSelector(state => state.drinkActions);
    
    // State variables for UI and form management
    const [isEditingAsAdmin, setIsEditingAsAdmin] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUsingUrl, setIsUsingUrl] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageHovered, setIsImageHovered] = useState(false);

    useEffect(() => {
        if (id && token) {
            dispatch(fetchDrinkForUpdate({ id, token }))
                .unwrap()
                .then(drink => {
                    if (drink.email !== user.email && isAdmin) {
                        setIsEditingAsAdmin(true);
                        toast.info('You are editing this drink as an admin', {
                            icon: <FaUserShield className="text-blue-500" />
                        });
                    }
                    
                    if (drink.drinkImage) {
                        setPreviewUrl(drink.drinkImage);
                    }
                })
                .catch(error => {
                    console.error("Error fetching drink:", error);
                    if (error.includes("Unauthorized")) {
                        toast.error("You don't have permission to edit this drink", {
                            icon: <FaExclamationTriangle className="text-red-500" />
                        });
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
            setIsSubmitting(false);
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
                setIsSubmitting(false);
            }
        }
    };

    if (loading && !drinkForUpdate) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-600">Loading drink details...</p>
                </div>
            </div>
        );
    }

    if (!drinkForUpdate) return null;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Update Drink</title>
            </Helmet>
            
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        {/* Header */}
                        <div className="bg-blue-50 border-b border-blue-100 px-6 py-8">
                            <h1 className="text-3xl font-bold text-gray-800 text-center">Update Drink Item</h1>
                            <p className="text-center mt-2 text-gray-600">Make changes to your drink item information</p>
                        </div>
                        
                        {isEditingAsAdmin && (
                            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center">
                                <FaUserShield className="text-blue-500 mr-2 flex-shrink-0" />
                                <p className="text-blue-700 text-sm">
                                    <span className="font-semibold">Admin Mode:</span> You are editing content created by {drinkForUpdate.email}
                                </p>
                            </div>
                        )}
                        
                        <form onSubmit={handleUpdateDrink} className="p-6 space-y-8">
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-50 disabled:text-gray-500" 
                                            placeholder="Enter name" 
                                            required
                                            disabled={true}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input 
                                            defaultValue={user.email} 
                                            type="email" 
                                            name="email" 
                                            id="email" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-50 disabled:text-gray-500" 
                                            placeholder="Enter email" 
                                            required 
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6 col-span-full md:col-span-1">
                                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Drink Information</h2>
                                    
                                    <div>
                                        <label htmlFor="drink" className="block text-sm font-medium text-gray-700">Drink Name*</label>
                                        <input 
                                            defaultValue={drinkForUpdate.drinkName} 
                                            type="text" 
                                            name="drink" 
                                            id="drink" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                            placeholder="Enter drink name" 
                                            required 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price*</label>
                                        <input 
                                            defaultValue={drinkForUpdate.drinkPrice} 
                                            type="number" 
                                            name="price" 
                                            id="price" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                            placeholder="Enter drink price" 
                                            required 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description</label>
                                        <input 
                                            defaultValue={drinkForUpdate.drinkDescription} 
                                            type="text" 
                                            name="description" 
                                            id="description" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                            placeholder="Enter description (optional)" 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Drink Category</label>
                                        <input 
                                            defaultValue={drinkForUpdate.drinkCategory} 
                                            type="text" 
                                            name="category" 
                                            id="category" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                            placeholder="Enter drink category (optional)" 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Drink Origin</label>
                                        <input 
                                            defaultValue={drinkForUpdate.drinkOrigin} 
                                            type="text" 
                                            name="origin" 
                                            id="origin" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                            placeholder="Enter drink origin (optional)" 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Drink Quantity*</label>
                                        <input 
                                            defaultValue={drinkForUpdate.drinkQuantity} 
                                            type="number" 
                                            name="quantity" 
                                            id="quantity" 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                                            placeholder="Enter drink quantity" 
                                            required 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Drink Image</h2>
                                
                                <div className="flex justify-between items-center">
                                    <button 
                                        type="button" 
                                        onClick={handleToggleUploadMethod} 
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                        disabled={isSubmitting}
                                    >
                                        {isUsingUrl ? (
                                            <>
                                                <FaUpload className="mr-2" />
                                                Switch to file upload
                                            </>
                                        ) : (
                                            <>
                                                <FaLink className="mr-2" />
                                                Use image URL instead
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {isUsingUrl ? (
                                    <input 
                                        defaultValue={drinkForUpdate.drinkImage} 
                                        type="text" 
                                        name="image" 
                                        id="image" 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
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
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            required={!previewUrl}
                                            disabled={isSubmitting}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Choose a new image file to update the current image.</p>
                                    </>
                                )}
                                
                                {previewUrl && (
                                    <div 
                                        className="relative mt-4"
                                        onMouseEnter={() => setIsImageHovered(true)}
                                        onMouseLeave={() => setIsImageHovered(false)}
                                    >
                                        <img 
                                            src={previewUrl} 
                                            alt="Drink preview" 
                                            className="h-48 w-full object-cover rounded-lg border border-gray-300" 
                                        />
                                        {isImageHovered && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                <p className="text-white text-sm">Image Preview</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || loading}
                                    className="w-full flex justify-center items-center px-5 py-3 text-lg font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdateDrink;