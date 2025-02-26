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
    const [display, setDisplay] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
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
                .then(data => {
                    setDisplay(data);
                    setQuantity(1);
                    setTotalPrice(parseFloat(data.foodPrice));
                })
                .catch(error => {
                    console.error('Error:', error);
                    toast.error('Error loading food details');
                });
        }
    }, [id, navigate, dispatch, token]);

    useEffect(() => {
        if (display && display.foodPrice) {
            const basePrice = parseFloat(display.foodPrice);
            setTotalPrice((basePrice * quantity).toFixed(2));
        }
    }, [quantity, display]);

    const validateDate = (selectedDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        return selected >= today;
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        if (newQuantity >= 1 && newQuantity <= parseInt(display.foodQuantity)) {
            setQuantity(newQuantity);
        } else if (newQuantity > parseInt(display.foodQuantity)) {
            setQuantity(parseInt(display.foodQuantity));
            toast.error(`Maximum available quantity is ${display.foodQuantity}`);
        } else {
            setQuantity(1);
        }
    };

    const handlePurchase = async (orderData) => {
        try {
            if (!token) {
                toast.error('Please log in first');
                navigate('/signIn');
                return;
            }

            if (!validateDate(orderData.date)) {
                toast.error('Please select today or a future date');
                return;
            }

            if (quantity <= 0 || quantity > display.foodQuantity) {
                toast.error(`Please select a quantity between 1 and ${display.foodQuantity}`);
                return;
            }

            orderData.foodPrice = display.foodPrice;
            orderData.totalPrice = totalPrice;

            await dispatch(orderFood({ orderData, token })).unwrap();
            toast.success('Order placed successfully!');
            navigate('/orderFood', { state: { newOrder: true } });
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.message || 'Error placing order. Please try again.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const buyerName = user.displayName;
        const email = user.email;
        const foodName = display.foodName;
        const foodPrice = display.foodPrice;
        const date = form.date.value;
        const foodImage = display.foodImage;
        const foodId = id;

        const addProduct = {
            buyerName,
            email, 
            foodPrice,
            totalPrice,
            foodName, 
            date, 
            quantity,
            foodImage, 
            foodId,
            userEmail: email
        };

        handlePurchase(addProduct);
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
                        
                        <form className='w-full' onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="w-full">
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Buyer Name</label>
                                    <input 
                                        defaultValue={user.displayName} 
                                        type="text" 
                                        name="name" 
                                        id="name" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                        readOnly
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Buyer Email</label>
                                    <input 
                                        defaultValue={user.email} 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                        readOnly
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="food" className="block mb-2 text-sm font-medium text-gray-900">Food Name</label>
                                    <input 
                                        value={display.foodName} 
                                        type="text" 
                                        name="food" 
                                        id="food" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                        readOnly
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900">Delivery Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        id="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                        required 
                                    />
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Quantity</label>
                                    <input  
                                        min="1"
                                        max={display.foodQuantity} 
                                        type="number" 
                                        name="quantity" 
                                        id="quantity" 
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Available: {display.foodQuantity} items
                                    </p>
                                </div>
                                
                                <div className="w-full">
                                    <label htmlFor="pricePerItem" className="block mb-2 text-sm font-medium text-gray-900">Price Per Item</label>
                                    <div className="flex items-center">
                                        <span className="bg-gray-200 rounded-l-lg p-2.5 text-gray-600">$</span>
                                        <input 
                                            type="text" 
                                            id="pricePerItem" 
                                            value={display.foodPrice}
                                            className="bg-gray-50 border-y border-r border-gray-300 text-gray-900 text-sm rounded-r-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                
                                <div className="w-full bg-gray-100 p-4 rounded-lg mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-gray-900">Total Price:</span>
                                        <span className="text-xl font-bold text-gray-900">${totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="flex w-full justify-center items-center px-5 py-2.5 mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                                disabled={quantity < 1 || quantity > display.foodQuantity}
                            >
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