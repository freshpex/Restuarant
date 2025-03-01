import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, deleteOrder } from '../../redux/slices/foodActionsSlice';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../Components/LoadingSpinner';
import PaymentModal from '../../Components/PaymentModal';
import { createWhatsAppLink } from '../../utils/paymentUtils';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderFood = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(state => state.auth);
    const { orders, loading, error } = useSelector(state => state.foodActions);
    const token = localStorage.getItem('token');
    
    // Add payment loading state
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    
    const isNewOrder = location.state?.newOrder;
    
    const chefPhone = "+2349041801170";

    useEffect(() => {
        if (!token) {
            navigate('/signIn');
            return;
        }
        
        if (user?.email) {
            dispatch(fetchOrders({ email: user.email, token }))
                .unwrap()
                .then(data => {
                    if (isNewOrder && data && data.length > 0) {
                        setCurrentOrder(data[0]);
                        setShowPaymentModal(true);
                    }
                })
                .catch(err => {
                    console.error('Error fetching orders:', err);
                    if (err === 'Invalid or expired token') {
                        toast.error('Your session has expired. Please sign in again.');
                        localStorage.removeItem('token');
                        navigate('/signIn');
                    } else {
                        toast.error(err || 'Failed to fetch orders');
                    }
                });
        }
    }, [dispatch, user, token, navigate, isNewOrder]);

    const handleDelete = async (id) => {
        if (!token) {
            navigate('/signIn');
            return;
        }

        try {
            await dispatch(deleteOrder({ id, token })).unwrap();
            toast.success('Order removed successfully');
        } catch (error) {
            toast.error('Failed to remove order');
        }
    };
    
    const handlePaymentSuccess = async (orderData, paymentResponse) => {
        try {
            toast.success('Payment successful! Your order has been placed.');
            setShowPaymentModal(false);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Payment recorded but there was an issue updating your order status.');
        }
    };
    
    const handleWhatsAppChat = () => {
        if (!currentOrder) return;
        
        const whatsappLink = createWhatsAppLink(chefPhone, currentOrder);
        window.open(whatsappLink, '_blank');
        setShowPaymentModal(false);
        toast.success('WhatsApp chat initiated. Please confirm your order with the chef.');
    };
    
    // Updated handler for online payment with loading state
    const handlePayOnline = () => {
        if (!currentOrder || !user) return;
        
        setIsPaymentLoading(true);
        
        const unitPrice = parseFloat(currentOrder.foodPrice);
        const quantity = parseInt(currentOrder.quantity);
        const totalPrice = currentOrder.totalPrice || (unitPrice * quantity).toFixed(2);
        
        const config = {
            public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: `tk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            amount: parseFloat(totalPrice),
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd,banktransfer',
            customer: {
                email: user.email,
                phone_number: '',
                name: user.displayName || currentOrder.buyerName,
            },
            customizations: {
                title: "Tim's Kitchen Payment",
                description: `Payment for ${currentOrder.foodName} x ${currentOrder.quantity}`,
                logo: "/logo.png",
            },
        };
        
        const handleFlutterPayment = useFlutterwave(config);
        
        setTimeout(() => {
            handleFlutterPayment({
                callback: (response) => {
                    setIsPaymentLoading(false);
                    if (response.status === "successful") {
                        handlePaymentSuccess(currentOrder, response);
                    } else {
                        toast.error('Payment was not completed.');
                    }
                    
                    setShowPaymentModal(false);
                },
                onClose: () => {
                    console.log("Payment modal closed by user");
                    setIsPaymentLoading(false);
                    toast.info('Payment cancelled');
                    setShowPaymentModal(false);
                },
            });
        }, 100);
    };

    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Ordered-Food</title>
            </Helmet>
            {loading && <div className="text-yellow-500 text-center py-10"><LoadingSpinner /></div>}

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    if (isPaymentLoading) {
                        if (window.confirm('Payment is in progress. Closing now may result in a failed transaction. Are you sure?')) {
                            setShowPaymentModal(false);
                        }
                    } else {
                        setShowPaymentModal(false);
                    }
                }}
                onWhatsAppChat={handleWhatsAppChat}
                onPayOnline={handlePayOnline}
                chefPhone={chefPhone}
                orderDetails={currentOrder}
                isPaymentLoading={isPaymentLoading}
            />
            
            <h2 className='text-3xl pt-44 text-center text-white bg-[#121212]'>
                My Ordered Food
            </h2>
            
            {orders.length > 0 ? (
                <div className='bg-[#121212] lg:px-28 px-6 pt-10 pb-44 flex flex-col gap-8 justify-center items-center'>
                    {orders.map(data => (
                        <div className="card sm:card-side w-full lg:w-[800px] bg-base-100" key={data._id}>
                            <figure>
                                <img 
                                    className='lg:w-[350px] lg:h-[244px]'
                                    src={data.foodImage}
                                    alt={data.foodName}
                                />
                            </figure>
                            <div className="card-body">
                                <div className="flex justify-between items-center">
                                    <h2 className="card-title">{data.foodName}</h2>
                                    <h2 className="card-title">₦ {data.foodPrice}</h2>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <h2 className="">Food Owner: {data.buyerName}</h2>
                                    <h2 className="">Purchase Date: {data.date}</h2>
                                    <h2 className="">Quantity: {data.quantity}</h2>
                                </div>
                                
                                <div className="card-actions justify-end mt-5 flex">
                                    <button 
                                        onClick={() => {
                                            setCurrentOrder(data);
                                            setShowPaymentModal(true);
                                        }} 
                                        className="px-4 py-2 rounded-md text-white bg-green-600 tracking-wider mr-2">
                                        Payment Options
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(data._id)} 
                                        className="px-4 py-2 rounded-md text-white bg-black tracking-wider">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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