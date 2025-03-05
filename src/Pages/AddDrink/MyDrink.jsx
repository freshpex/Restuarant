import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserDrinks } from '../../redux/slices/drinkActionsSlice';
import MyDrinkCard from './MyDrinkCard';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyDrink = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { userDrinks, loading, error } = useSelector(state => state.drinkActions);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/signIn');
            return;
        }

        if (user?.email) {
            dispatch(fetchUserDrinks({ email: user.email, token }))
                .unwrap()
                .catch(err => {
                    if (err === 'Invalid or expired token') {
                        toast.error('Your session has expired. Please sign in again.');
                        localStorage.removeItem('token');
                        navigate('/signIn');
                        return;
                    }
                    toast.error(err || 'Failed to fetch drinks');
                });
        }
    }, [dispatch, user, token, navigate]);

    if (loading) return <LoadingSpinner />;

    return (
        <>
        {loading && <div className="text-yellow-500 text-center py-10"><LoadingSpinner /></div>}
            {userDrinks.length > 0 ? (
                <div className='bg-[#121212] py-40 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 lg:px-28 px-6'>
                    {userDrinks.map(drink => <MyDrinkCard key={drink._id} display={drink} />)}
                </div>
            ) : (
                <div className='bg-[#121212] h-screen flex justify-center items-center text-3xl text-gray-800'>
                    <h2>{error || 'No Drink Items have been Added'}</h2>
                </div>
            )}
        </>
    );
};

export default MyDrink;