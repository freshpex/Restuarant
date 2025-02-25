import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoodById } from '../../redux/slices/foodSlice';
import { orderFood } from '../../redux/slices/foodActionsSlice';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

const FoodOrder = () => {
    window.scrollTo(0,0);
    const [display, setDisplay] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get user from Redux instead of Context
    const { user } = useSelector(state => state.auth);
    const { currentFood: food, loading: foodLoading } = useSelector(state => state.food);
    const { loading: orderLoading, error } = useSelector(state => state.foodActions);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            toast.error('Please log in first');
            navigate('/signIn');
            return;
        }

        if (id) {
            dispatch(fetchFoodById(id))
                .unwrap()
                .then(data => setDisplay(data))
                .catch(error => {
                    console.error('Error:', error);
                    toast.error('Error loading food details');
                });
        }
    }, [id, navigate, dispatch, token]);

    const handlePurchase = async (orderData) => {
        try {
            if (!token) {
                toast.error('Please log in first');
                navigate('/signIn');
                return;
            }

            await dispatch(orderFood({ orderData, token })).unwrap();
            toast.success('Order placed successfully!');
            navigate('/orderFood');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error || 'Error placing order. Please try again.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const buyerName = user.displayName;
        const email = user.email;
        const foodName = form.food.value;
        const foodPrice = form.price.value;
        const date = form.date.value;
        const quantity = form.quantity.value;
        const foodImage = form.image.value;
        const foodId = id;

        const addProduct = {
            buyerName,
            email, 
            foodPrice, 
            foodName, 
            date, 
            quantity,
            foodImage, 
            foodId,
            userEmail: email // Add this for backend validation
        };

        if (quantity > 0) {
            handlePurchase(addProduct);
        } else {
            toast.error("Invalid quantity");
        }
    };

    if (foodLoading || orderLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
    if (!display) return <div className="text-center py-10">Loading food details...</div>;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Food-Order</title>
            </Helmet>
            <Header2 />
            <div className='bg-[#121212] lg:px-28 px-4 w-full py-32 flex flex-col justify-center items-center'>
                <section className="w-full lg:w-[33%] rounded-lg px-4 py-4 mt-20 mx-auto lg:pb-10 bg-[#F4F3F0]">
                    <div className="py-8 px-4 mx-auto w-full lg:py-2">
                        <h2 className="mb-16 text-2xl text-center font-bold text-gray-900 ">Confirm Your Purchase</h2>
                        
                        <form className=' w-full' onSubmit={handleSubmit} >
                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6"></div>
                                
                                <div className="w-full">
                                    <label for="name" className="block mb-2 text-sm font-medium text-gray-900 ">Buyer Name</label>
                                    <input defaultValue={user.displayName} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name" readOnly/>
                                </div>
                                <div className="w-full">
                                    <label for="email" className="block mb-2 text-sm font-medium text-gray-900 ">Buyer Email</label>
                                    <input defaultValue={user.email} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name"  />
                                </div>
                                <div className="w-full">
                                    <label for="food" className="block mb-2 text-sm font-medium text-gray-900 ">Food Name</label>
                                    <input defaultValue={display.foodName} type="text" name="food" id="food" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product type" required />
                                </div>
                                <div className="w-full">
                                    <label for="price" className="block mb-2 text-sm font-medium text-gray-900 ">Price</label>
                                    <input defaultValue={display.foodPrice} type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product price" required/>
                                </div>
                                <div className="w-full">
                                    <label for="date" className="block mb-2 text-sm font-medium text-gray-900 ">Date</label>
                                    <input type="date" name="date" id="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter description" required />
                                </div>
                                <div className="w-full">
                                    <label for="quantity" className="block mb-2 text-sm font-medium text-gray-900 ">Quantity</label>
                                    <input  max={display.foodQuantity} defaultValue={display.foodQuantity} type="number" name="quantity" id="quantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your quantity" required/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label for="image" className="block mb-2 text-sm font-medium text-gray-900 ">Food Image</label>
                                    <input defaultValue={display.foodImage} type='text' name='image'  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500  dark:placeholder-gray-400  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food  image url" />
                                </div>
                            <button type="submit" className="flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
                            Purchase Now
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
};

export default FoodOrder;