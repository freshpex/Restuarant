import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopFoods } from '../redux/slices/foodActionsSlice';
import { selectTopFoods } from '../redux/selectors';
import { Link } from 'react-router-dom';
import TopSellingFood from './TopSellingFood';
import LoadingSpinner from '../Components/LoadingSpinner';

const TopSelling = () => {
    const dispatch = useDispatch();
    const topFoods = useSelector(selectTopFoods) || [];
    const loading = useSelector(state => state.foodActions.loading);
    const error = useSelector(state => state.foodActions.error);

    useEffect(() => {
        dispatch(fetchTopFoods());
    }, [dispatch]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    // Take only the first 6 items
    const displayedItems = topFoods.slice(0, 6);

    return (
        <>
            <div className="bg-[#121212] flex-col flex gap-4 py-4 justify-center items-center">
                <div className=" flex gap-4 lg:flex-col flex-col items-center ">
                    <div className=" rounded-md w-10 h-1 bg-yellow-700"></div>
                    <div>
                        <h2 className=" text-white text-sm tracking-widest pb-3">Top Food</h2>
                    </div>
                </div>
                <div>
                    <h2 className=" text-gray-200 pb-16 text-center text-3xl tracking-wider font-bold "> Top Selling Food</h2>
                </div>
            </div>
            <div className='lg:px-28 px-6 bg-[#121212] pb-20 pt-10 grid grid-cols-1 md:grid-cols-2 gap-10 lg:grid-cols-3'>
                {displayedItems.map(data => 
                    <TopSellingFood data={data} key={data._id} />
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