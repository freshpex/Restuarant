import React, { useContext, useEffect, useState } from 'react';
import Header2 from '../Header/Header2';
import { AuthContext } from '../../AuthProvider/AuthProvider';
import { useLoaderData } from 'react-router-dom';
import MyFoodCard from './MyFoodCard';
import axios from 'axios';
const MyFood = () => {

    
    const {user} = useContext(AuthContext)
    // const [added, setAdded] = useState([])

    const orderedFood = useLoaderData()


   const filterdOrder = orderedFood.filter(item => item.email === user.email)
   const [shoppingCart, setCart] = useState(filterdOrder)


    // useEffect(() => {
    //     axios.get(`${import.meta.env.VITE_API}/addFood?email=${user?.email}`)
    //     .then(res => {
    //         console.log(res.data)
    //         setAdded(res.data)
    //     })
    // }, [])

    // useEffect(() => {
    //     fetch(`${import.meta.env.VITE_API}/addFood`)
    //     .then(res => res.json())
    //     .then(data => {
    //         const add = data.filter(item => item.email === user.email)
    //         setAdded(add)
    //     })
    // }, [])

    

    // useEffect(() => {
    //     fetch(`${import.meta.env.VITE_API}/addFood?email=${user.email}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         console.log(data)
    //         setFood(data)
    //     })
    // }, [])
    return (
        <>

        <Header2 />

        {shoppingCart.length > 0 ? 
        <div className=' bg-[#121212] py-40 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1  lg:px-28 px-6'>
        {shoppingCart.map(display => <MyFoodCard display={display} key={display._id}  />)}
    </div>

    : 
    <div className='bg-[#121212] h-screen flex justify-center items-center text-3xl text-gray-800'>
      <h2>No Food Items are Added</h2>
    </div>
    
    
        }
        
        </>
    );
};

export default MyFood;