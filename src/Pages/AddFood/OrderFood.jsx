import React, { useContext, useEffect, useState } from 'react';
import Header2 from '../Header/Header2';
import { AuthContext } from '../../AuthProvider/AuthProvider';
import { Helmet } from 'react-helmet';
import { useLoaderData } from 'react-router-dom';
import axios from 'axios';

const OrderFood = () => {

    const {user} = useContext(AuthContext)
    

    const orderedFood = useLoaderData()


   const filterdOrder = orderedFood.filter(item => item.email === user.email)
   const [shoppingCart, setCart] = useState(filterdOrder)
  //   useEffect(() => {
  //     axios.get(`${import.meta.env.VITE_API}/purchaseFood?email=${user?.email}`)
  //     .then(res => {
  //         console.log(res.data)
  //         setCart(res.data)
  //     })
  // }, [])
        

     


    const handleDelete = (id) => {
        fetch(`${import.meta.env.VITE_API}/purchaseFood/${id}`, {
            method : "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const deletedOne = shoppingCart.filter(item => item._id !== id)
            setCart(deletedOne)
        })
    }

    
    return (
        <>
         <Helmet>
            <title>Tim's Kitchen | Ordered-Food</title>
         </Helmet>
        <Header2 />
        <h2 className=' text-3xl pt-44 text-center text-white bg-[#121212]'>My Ordered Food</h2>
        {shoppingCart.length > 0 ?
        <div className=' bg-[#121212] lg:px-28 px-6  pt-10 pb-44 flex flex-col gap-8 justify-center items-center'>
        {shoppingCart.map(data => {
            return <div className="card   sm:card-side w-full lg:w-[800px] bg-base-100 ">
            <figure>
              <img 
                className=' lg:w-[350px] lg:h-[244px]'
                src={data.foodImage}
                alt="Album"
              />
            </figure>
            <div className="card-body">
              <div className=" flex justify-between items-center">
              <h2 className="card-title">{data.foodName}</h2>
              <h2 className="card-title"> $ {data.foodPrice}</h2>
              </div>
              
              {/* <span class="bg-blue-200 text-blue-800 text-base font-semibold  px-3 py-2 flex justify-start flex-row w-[180px]  mb-2 mt-2 text-center rounded  dark:text-blue-800 ">Rating : {data.rating}.0 / 10.0</span> */}
              <div className="flex flex-col  gap-2 ">
              
              <h2 className=""> Food Owner : {data.buyerName}</h2>
              <h2 className=""> Purchase Date : {data.date}</h2>
              </div>
              
              <div className="card-actions justify-end mt-10">
                <button onClick={() => handleDelete(data._id)} className="px-4 py-2 rounded-md text-white bg-black tracking-wider">Remove</button>
              </div>
            </div>
          </div>
        })}
    
    </div>

    : 

    <div className=' h-[80vh] bg-[#121212] flex items-center justify-center'>
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7236766-5875081.png?f=webp" alt="" />
        </div>
      
      
      
      }
        
        
        </>
    );
};

export default OrderFood;