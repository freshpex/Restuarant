import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchFoodById } from '../../redux/slices/foodSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaShoppingCart } from 'react-icons/fa';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
} from "@material-tailwind/react";
import { formatPrice } from '../../utils/formatUtils';

const SeeFood = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { currentFood: display, loading, error } = useSelector(state => state.food);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            dispatch(fetchFoodById(id));
        }
    }, [dispatch, id]);

    const handleAddToCart = () => {
        dispatch(addToCart({ 
            item: display, 
            quantity 
        }));
        toast.success(`${display.foodName} added to cart!`);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return (
        <div className="text-red-500 text-center py-10 bg-[#121212]">
            Error: {error}
        </div>
    );
    if (!display) return (
        <div className="text-white text-center py-10 bg-[#121212]">
            Loading food details...
        </div>
    );

    return (
        <>
            {/* <Header2 /> */}
            <Helmet>
                <title>Tim's Kitchen | See-Food </title>
            </Helmet>
            <div className='bg-[#121212] lg:px-28 px-6 lg:py-0 py-44 lg:pt-20 flex md:h-screen justify-center items-center'>
                <Card className="w-full max-w-[48rem]  flex flex-col lg:flex-row">
                    <CardHeader
                        shadow={false}
                        floated={false}
                        className="m-0 w-full md:w-2/5 shrink-0 rounded-r-none"
                    >
                        <img
                            src={display.foodImage}
                            alt="card-image"
                            className="lg:h-full  lg:w-full lg:object-cover"
                        />
                    </CardHeader>
                    <CardBody className=' lg:px-10'>
                        <Typography variant="h6" color="gray" className="mb-4 uppercase">
                            {display.foodCategory}
                        </Typography>
                        <Typography variant="h4" color="blue-gray" className="mb-2">
                            {display.foodName}
                        </Typography>
                        <Typography variant="h6" color="gray" className="mb-2">
                            Country : {display.foodOrigin}
                        </Typography>
                        <Typography variant="h6" color="gray" className="mb-2">
                            Price : {formatPrice(parseFloat(display.foodPrice))}
                        </Typography>
                        <Typography variant="h6" color="gray" className="mb-2">
                            Made By : {display.chefName}
                        </Typography>
                        <Typography color="gray" className="mb-8 font-normal">
                            {display.foodDescription}
                        </Typography>
                        
                        {/* Quantity selector */}
                        <div className="mb-4">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                            </label>
                            <div className="flex items-center">
                                <button 
                                    type="button" 
                                    className="p-2 border border-gray-300 rounded-l"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    id="quantity" 
                                    min="1"
                                    max={display.foodQuantity}
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Math.min(parseInt(display.foodQuantity), Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-16 text-center border-y border-gray-300 py-2"
                                />
                                <button 
                                    type="button" 
                                    className="p-2 border border-gray-300 rounded-r"
                                    onClick={() => setQuantity(Math.min(parseInt(display.foodQuantity), quantity + 1))}
                                >
                                    +
                                </button>
                                <span className="ml-4 text-sm text-gray-500">
                                    Available: {display.foodQuantity}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <Link to={`/foodOrder/${display._id}`} className="inline-block">
                                <Button variant="text" className="flex hover:bg-yellow-700 items-center gap-1">
                                    Order Now
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                        />
                                    </svg>
                                </Button>
                            </Link>
                            <Button 
                                variant="text" 
                                color="yellow"
                                className="flex items-center gap-1"
                                onClick={handleAddToCart}
                            >
                                <FaShoppingCart className="h-4 w-4" />
                                Add to Cart
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
};

export default SeeFood;