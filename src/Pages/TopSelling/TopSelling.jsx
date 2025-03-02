import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopFoods } from '../../redux/slices/foodActionsSlice';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../Components/LoadingSpinner';
import TopFoodCard from './TopFoodCard';
import { selectTopFoods } from '../../redux/selectors';
import { Link } from 'react-router-dom';

const TopSelling = () => {
    const dispatch = useDispatch();
    const topFoods = useSelector(selectTopFoods);
    const { loading, error } = useSelector(state => state.foodActions);

    useEffect(() => {
        dispatch(fetchTopFoods());
    }, [dispatch]);

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Top-Selling</title>
            </Helmet>
            <div className='bg-[#121212] lg:px-28 px-6 py-44  pb-20'>
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Top Selling Foods</h1>
                    <p className="text-gray-300 max-w-2xl text-center">
                        Our most popular dishes loved by customers. Try these fan favorites today!
                    </p>
                </div>
                
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-red-500 text-center py-10">
                        Error: {error}
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
            </div>
            <div className='bg-[#121212] pt-8 pb-36 flex justify-center items-center'>
                <Link to="/food">
                    <button className='text-gray-900 bg-yellow-700 px-5 py-3 rounded-lg tracking-wider'>
                        See All Food
                    </button>
                </Link>
            </div>
        </>
    );
};

export default TopSelling;