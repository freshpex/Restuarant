import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserFoods } from '../../redux/slices/foodActionsSlice';
import toast from 'react-hot-toast';
import Header2 from '../Header/Header2';
import MyFoodCard from './MyFoodCard';
import LoadingSpinner from '../../Components/LoadingSpinner';

const MyFood = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useSelector(state => state.auth);
    const { userFoods, loading, error } = useSelector(state => state.foodActions);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signIn');
            return;
        }

        if (user?.email) {
            dispatch(fetchUserFoods({ email: user.email, token }))
                .unwrap()
                .catch(error => {
                    if (error.includes('unauthorized') || error.includes('token')) {
                        navigate('/signIn');
                    }
                    toast.error(error);
                });
        }
    }, [dispatch, user, token, isAuthenticated, navigate]);

    return (
        <>
            <Header2 />
            {loading ? (
                <LoadingSpinner />
            ) : userFoods.length >= 1 ? (                
                <div className='bg-[#121212] py-40 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 lg:px-28 px-6'>
                    {userFoods.map(food => 
                        <MyFoodCard display={food} key={food._id} />
                    )}
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-10">
                    Error: {error}
                </div>            
            ) : (
                <div className='bg-[#121212] h-screen flex justify-center items-center text-3xl text-gray-800'>
                    <h2>No Food Items have been Added</h2>
                </div>
            )}
        </>
    );
};

export default MyFood;