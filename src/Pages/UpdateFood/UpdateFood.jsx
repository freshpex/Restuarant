import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateFood, clearSuccess, clearError, fetchFoodForUpdate, clearFoodForUpdate } from '../../redux/slices/foodActionsSlice';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';

const UpdateFood = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const token = localStorage.getItem('token');
    const { loading, error, success, foodForUpdate } = useSelector(state => state.foodActions);

    useEffect(() => {
        // Fetch food details when component mounts
        if (id && token) {
            dispatch(fetchFoodForUpdate({ id, token }));
        }
        
        // Cleanup when component unmounts
        return () => {
            dispatch(clearFoodForUpdate());
        };
    }, [dispatch, id, token]);

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

    const handleUpdateFood = async (e) => {
        e.preventDefault();
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
            foodImage: form.image.value
        };

        dispatch(updateFood({ id, foodData: updatedFood, token }));
    };

    if (loading) return <LoadingSpinner />;
    if (!foodForUpdate) return <div className="text-center py-10 text-white bg-[#121212]">Loading food details...</div>;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Update-Food</title>
            </Helmet>
            <Header2 />
            <div className='bg-[#121212] lg:px-20 px-6 w-full py-44 flex flex-col justify-center items-center'>
                <section className="w-full lg:w-[38%] rounded-lg px-4 py-4 mx-auto lg:pb-10 bg-[#F4F3F0]">
                    <div className="py-8 px-4 mx-auto w-full lg:py-2">
                        <h2 className="mb-16 text-2xl text-center font-bold text-gray-900">
                            Update Food Item
                        </h2>
                        
                        <form className='w-full' onSubmit={handleUpdateFood}>
                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                                <div className="w-full">
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 ">Name</label>
                                    <input defaultValue={user.displayName} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name" required/>
                                </div>
                                <div className="w-full">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">Email</label>
                                    <input defaultValue={user.email} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name" required />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="food" className="block mb-2 text-sm font-medium text-gray-900 ">Food Name</label>
                                    <input defaultValue={foodForUpdate.foodName}  type="text" name="food" id="food" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product type" required />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 ">Price</label>
                                    <input  defaultValue={foodForUpdate.foodPrice} type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product price" required/>
                                </div>
                                <div className="w-full">
                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 ">Short Description</label>
                                    <input defaultValue={foodForUpdate.foodDescription} type="text" name="description" id="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter description" required />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 ">Food Category</label>
                                    <input defaultValue={foodForUpdate.foodCategory} type="text" name="category" id="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food category" required />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 ">Food Image</label>
                                    <input defaultValue={foodForUpdate.foodImage} type="text" name="image" id="image" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food url" required />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="origin" className="block mb-2 text-sm font-medium text-gray-900 ">Food Origin</label>
                                    <input defaultValue={foodForUpdate.foodOrigin} type="text" name="origin" id="origin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food image url" required />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900 ">Food Quantity</label>
                                    <input defaultValue={foodForUpdate.foodQuantity} type='number' name='quantity'  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500  dark:placeholder-gray-400  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food  quantity" />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                            >
                                {loading ? 'Updating...' : 'Update Food'}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
};

export default UpdateFood;