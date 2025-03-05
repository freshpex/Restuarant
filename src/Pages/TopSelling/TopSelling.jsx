import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopFoods } from '../../redux/slices/foodActionsSlice';
import { fetchTopDrinks } from '../../redux/slices/drinkActionsSlice';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../Components/LoadingSpinner';
import TopFoodCard from './TopFoodCard';
import TopDrinkCard from './TopDrinkCard';
import { selectTopFoods, selectTopDrinks } from '../../redux/selectors';
import { Link } from 'react-router-dom';
import { FaUtensils, FaGlassMartiniAlt } from 'react-icons/fa';

const TopSelling = () => {
    const dispatch = useDispatch();
    const topFoods = useSelector(selectTopFoods);
    const topDrinks = useSelector(selectTopDrinks);
    const { loading: foodsLoading, error: foodsError } = useSelector(state => state.foodActions);
    const { loading: drinksLoading, error: drinksError } = useSelector(state => state.drinkActions);

    useEffect(() => {
        dispatch(fetchTopFoods());
        dispatch(fetchTopDrinks());
    }, [dispatch]);

    const isLoading = foodsLoading || drinksLoading;
    const hasError = foodsError || drinksError;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Top-Selling</title>
            </Helmet>
            <div className='bg-gradient-to-b from-[#121212] to-[#1a1a1a] lg:px-28 px-6 pt-44 pb-20'>
                {/* Top Foods Section */}
                <div className="flex flex-col items-center mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <FaUtensils className="text-yellow-500 text-3xl" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">Top Selling Foods</h1>
                    </div>
                    <div className="h-1 w-24 bg-yellow-600 rounded mb-6"></div>
                    <p className="text-gray-300 max-w-2xl text-center">
                        Our most popular dishes loved by customers. Try these fan favorites today!
                    </p>
                </div>
                
                {foodsLoading ? (
                    <LoadingSpinner />
                ) : foodsError ? (
                    <div className="text-red-500 text-center py-10 rounded-lg bg-red-900 bg-opacity-20 border border-red-700">
                        Error: {foodsError}
                    </div>
                ) : topFoods && topFoods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {topFoods.map(food => (
                            <TopFoodCard key={food._id} food={food} />
                        ))}
                    </div>
                ) : (
                    <div className="text-white text-center py-10">
                        No top selling foods found.
                    </div>
                )}
                
                {/* Divider */}
                <div className="my-24 flex items-center">
                    <div className="flex-1 h-0.5 bg-gray-700"></div>
                    <div className="px-4 text-yellow-500">
                        <span className="px-3 py-1 border border-yellow-500 rounded-full">AND</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-700"></div>
                </div>
                
                {/* Top Drinks Section */}
                <div className="flex flex-col items-center mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <FaGlassMartiniAlt className="text-yellow-500 text-3xl" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">Top Selling Drinks</h1>
                    </div>
                    <div className="h-1 w-24 bg-yellow-600 rounded mb-6"></div>
                    <p className="text-gray-300 max-w-2xl text-center">
                        Refreshing beverages our customers can't get enough of. Perfect pairings for your meal!
                    </p>
                </div>
                
                {drinksLoading ? (
                    <LoadingSpinner />
                ) : drinksError ? (
                    <div className="text-red-500 text-center py-10 rounded-lg bg-red-900 bg-opacity-20 border border-red-700">
                        Error: {drinksError}
                    </div>
                ) : topDrinks && topDrinks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {topDrinks.map(drink => (
                            <TopDrinkCard key={drink._id} drink={drink} />
                        ))}
                    </div>
                ) : (
                    <div className="text-white text-center py-10">
                        No top selling drinks found.
                    </div>
                )}
            </div>
            
            <div className='bg-[#121212] pt-8 pb-36 flex justify-center items-center gap-6 flex-wrap'>
                <Link to="/food">
                    <button className='text-gray-900 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 px-6 py-3 rounded-lg tracking-wider transition-all shadow-lg hover:shadow-yellow-900/30 mb-4 sm:mb-0'>
                        Browse All Foods
                    </button>
                </Link>
                <Link to="/drinks">
                    <button className='text-white border-2 border-yellow-700 hover:bg-yellow-700/20 px-6 py-3 rounded-lg tracking-wider transition-all'>
                        Browse All Drinks
                    </button>
                </Link>
            </div>
        </>
    );
};

export default TopSelling;