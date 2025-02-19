import React, { useContext, useEffect, useState } from 'react';
import Header2 from '../Header/Header2';
import { AuthContext } from '../../AuthProvider/AuthProvider';
import { useLoaderData } from 'react-router-dom';
import MyFoodCard from './MyFoodCard';
import axios from 'axios';
import LoadingSpinner from '../../Components/LoadingSpinner';

const MyFood = () => {
    const {user} = useContext(AuthContext);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyFoods = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API}/foods/user/${user.email}`,
                    { credentials: 'include' }
                );
                if (!response.ok) throw new Error('Failed to fetch foods');
                const data = await response.json();
                setFoods(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchMyFoods();
        }
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!foods.length) {
        return (
            <div className='bg-[#121212] h-screen flex justify-center items-center text-3xl text-gray-800'>
                <h2>No Food Items are Added</h2>
            </div>
        );
    }

    return (
        <>
            <Header2 />
            <div className='bg-[#121212] py-40 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 lg:px-28 px-6'>
                {foods.map(food => <MyFoodCard display={food} key={food._id} />)}
            </div>
        </>
    );
};

export default MyFood;