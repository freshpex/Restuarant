import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { selectCartTotalQuantity } from '../redux/slices/cartSlice';

const CartIcon = () => {
  const totalQuantity = useSelector(selectCartTotalQuantity);

  return (
    <Link to="/cart" className="relative flex items-center">
      <FaShoppingCart className="text-xl lg:text-2xl" />
      <span className="absolute -top-2 -right-2 bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
        {totalQuantity}
      </span>
    </Link>
  );
};

export default CartIcon;
