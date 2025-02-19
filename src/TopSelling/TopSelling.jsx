import React, { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import TopSellingFood from './TopSellingFood';
import LoadingSpinner from '../Components/LoadingSpinner';

const TopSelling = () => {
    const [topSelling, setTopSelling] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopSelling = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API}/topSellingFoods`);
                if (!response.ok) {
                    throw new Error('Failed to fetch top selling foods');
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received');
                }
                setTopSelling(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching top selling foods:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopSelling();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!topSelling.length) return <div className="text-center py-10">No top selling foods found</div>;

    // Safely slice the array after checking it exists and is an array
    const displayedItems = topSelling.slice(0, 6);

    return (
        <>
            <div className=" bg-[#121212] flex-col flex gap-4 py-4 justify-center items-center">
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
        <div className=' lg:px-28 px-6 bg-[#121212] pb-20 pt-10 grid grid-cols-1 md:grid-cols-2 gap-10 lg:grid-cols-3'>
            {displayedItems.map(data=> <TopSellingFood data={data} key={data._id} />)}
        </div>

        <div className=' bg-[#121212] pt-8 pb-36 flex justify-center items-center'>
            <Link to="/food"><button className=' text-gray-900 bg-yellow-700 px-5 py-3 rounded-lg tracking-wider'>See All Food</button></Link>
            </div>
        </>
    );
};

export default TopSelling;