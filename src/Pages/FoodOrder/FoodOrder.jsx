import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../../AuthProvider/AuthProvider';
import toast from 'react-hot-toast';

const FoodOrder = () => {
    window.scrollTo(0,0)
    const [display,setDisplay] = useState([])
    const {user} = useContext(AuthContext)
    let {id} = useParams()

    console.log(user.email)
    console.log(user.displayName)
    
    

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API}/foods`)
         .then(res => res.json())
         .then(data => {
            const matchedFood = data.find(item => item._id === id)
            setDisplay(matchedFood)
         })
    }, [])
    const handlePurchase = (e) => {

        
        e.preventDefault()
        const form = e.target
        const buyerName =  user.displayName
        const email = user.email
        let foodName = form.food.value
        const foodPrice = form.price.value
        const date = form.date.value
        const quantity = form.quantity.value
        const foodImage = form.image.value
        const foodId = foodName

        const addProduct = {buyerName,email, foodPrice, foodName, date, quantity,foodImage, foodId}
        console.log(addProduct)

        if(quantity >0){
            fetch(`${import.meta.env.VITE_API}/purchaseFood`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(addProduct)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const toastId =toast.loading("Thank you for purchasing")
            toast.success("Thank you for purchasing", {id : toastId})
            // alert("Thank you for purchasing")
            form.reset()
        })
        }

        else{
            alert("Not available")
        }

        

        
    }

    

   
    console.log(display)
    return (
        <>
        
        <Helmet>
            <title>Tim's Kitchen | Food-Order</title>
        </Helmet>
        <Header2 />
        <div className=' bg-[#121212] lg:px-28 px-4    w-full  py-32 flex flex-col justify-center items-center'>
            
     <section className=" w-full lg:w-[33%] rounded-lg px-4 py-4 mt-20 mx-auto lg:pb-10 bg-[#F4F3F0]">
  <div className="py-8 px-4 mx-auto w-full lg:py-2">
      <h2 className="mb-16 text-2xl text-center font-bold text-gray-900 ">Confirm Your Purchase</h2>
      
      <form className=' w-full' onSubmit={handlePurchase} >
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              
              <div className="w-full">
                  <label for="name" className="block mb-2 text-sm font-medium text-gray-900 ">Buyer Name</label>
                  <input defaultValue={user.displayName} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name" readOnly/>
              </div>
              <div className="w-full">
                  <label for="email" className="block mb-2 text-sm font-medium text-gray-900 ">Buyer Email</label>
                  <input defaultValue={user.email} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name"  />
              </div>
              <div className="w-full">
                  <label for="food" className="block mb-2 text-sm font-medium text-gray-900 ">Food Name</label>
                  <input defaultValue={display.foodName} type="text" name="food" id="food" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product type" required />
              </div>
              <div className="w-full">
                  <label for="price" className="block mb-2 text-sm font-medium text-gray-900 ">Price</label>
                  <input defaultValue={display.foodPrice} type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product price" required/>
              </div>
              <div className="w-full">
                  <label for="date" className="block mb-2 text-sm font-medium text-gray-900 ">Date</label>
                  <input type="date" name="date" id="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter description" required />
              </div>
              <div className="w-full">
                  <label for="quantity" className="block mb-2 text-sm font-medium text-gray-900 ">Quantity</label>
                  <input  max={display.foodQuantity} defaultValue={display.foodQuantity} type="number" name="quantity" id="quantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your quantity" required/>
              </div>
              <div className="sm:col-span-2">
                  <label for="image" className="block mb-2 text-sm font-medium text-gray-900 ">Food Image</label>
                  <input defaultValue={display.foodImage} type='text' name='image'  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500  dark:placeholder-gray-400  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food  image url" />
              </div>
              
          </div>
          <button type="submit" className="flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
          Purchase Now
          </button>
      </form>
  </div>
</section>
        </div>
        </>
    );
};

export default FoodOrder;