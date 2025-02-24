import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, deleteOrder } from '../../redux/slices/foodActionsSlice';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../Components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderFood = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { orders, loading, error } = useSelector(state => state.foodActions);

    useEffect(() => {
        if (user?.email) {
            dispatch(fetchOrders(user.email));
        }
    }, [dispatch, user]);

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteOrder(id)).unwrap();
            toast.success('Order removed successfully');
        } catch (error) {
            toast.error('Failed to remove order');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Ordered-Food</title>
            </Helmet>
            <Header2 />
            <h2 className='text-3xl pt-44 text-center text-white bg-[#121212]'>
                My Ordered Food
            </h2>
            
            {orders.length > 0 ? (
                <div className='bg-[#121212] lg:px-28 px-6 pt-10 pb-44 flex flex-col gap-8 justify-center items-center'>
                    {/* ...existing JSX for order cards... */}
                </div>
            ) : (
                <div className='h-[80vh] bg-[#121212] flex items-center justify-center'>
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7236766-5875081.png?f=webp" alt="Empty cart" />
                </div>
            )}
        </>
    );
};

export default OrderFood;