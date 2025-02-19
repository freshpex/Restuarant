import React, { useContext } from 'react';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../../AuthProvider/AuthProvider';

import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const UpdateFood = () => {
    const {user} = useContext(AuthContext)
    const navigate = useNavigate()

    const data = useLoaderData()
    console.log(data)
    const handleAddCoffee = (e) => {
        e.preventDefault()
        const form = e.target
        const buyerName = user.displayName
        const email = user.email
        const foodName = form.food.value
        const foodPrice = form.price.value
        const foodCategory = form.category.value
        const foodDescription = form.description.value
        const foodOrigin = form.origin.value
        const foodQuantity = form.quantity.value
        const foodImage = form.image.value
    

        const addProduct = {buyerName,email, foodName, foodPrice, foodDescription,foodOrigin,  foodQuantity, foodCategory, foodImage}
        console.log(addProduct)

        fetch(`${import.meta.env.VITE_API}/update/${data._id}`, {
            method : "PUT",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(addProduct)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            // form.reset()
            const toastId =toast.loading("Food is updated")
            toast.success("Food is updated", {id : toastId})
               navigate(-1)
            
        })

        
    }
    
    return (
        <>
        
        <Helmet>
            <title>Tim's Kitchen | Update-Food</title>
        </Helmet>
        <Header2 />
        <div className=' bg-[#121212] lg:px-20 px-6   w-full  py-44 flex flex-col justify-center items-center'>
            
     <section className=" w-full lg:w-[38%] rounded-lg px-4 py-4 mx-auto lg:pb-10 bg-[#F4F3F0]">
  <div className="py-8 px-4 mx-auto w-full lg:py-2">
      <h2 className="mb-16 text-2xl text-center font-bold text-gray-900 ">Update a Food Item</h2>
      
      <form className=' w-full' onSubmit={handleAddCoffee} >
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              
              <div className="w-full">
                  <label for="name" className="block mb-2 text-sm font-medium text-gray-900 ">Name</label>
                  <input defaultValue={user.displayName} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name" required/>
              </div>
              <div className="w-full">
                  <label for="email" className="block mb-2 text-sm font-medium text-gray-900 ">Email</label>
                  <input defaultValue={user.email} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter brand name" required />
              </div>
              <div className="w-full">
                  <label for="food" className="block mb-2 text-sm font-medium text-gray-900 ">Food Name</label>
                  <input defaultValue={data.foodName}  type="text" name="food" id="food" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product type" required />
              </div>
              <div className="w-full">
                  <label for="price" className="block mb-2 text-sm font-medium text-gray-900 ">Price</label>
                  <input  defaultValue={data.foodPrice} type="number" name="price" id="price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter product price" required/>
              </div>
              <div className="w-full">
                  <label for="description" className="block mb-2 text-sm font-medium text-gray-900 ">Short Description</label>
                  <input defaultValue={data.foodDescription} type="text" name="description" id="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter description" required />
              </div>
              <div className="w-full">
                  <label for="category" className="block mb-2 text-sm font-medium text-gray-900 ">Food Category</label>
                  <input defaultValue={data.foodCategory} type="text" name="category" id="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food category" required />
              </div>
              <div className="w-full">
                  <label for="image" className="block mb-2 text-sm font-medium text-gray-900 ">Food Image</label>
                  <input defaultValue={data.foodImage} type="text" name="image" id="image" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food url" required />
              </div>
              <div className="w-full">
                  <label for="origin" className="block mb-2 text-sm font-medium text-gray-900 ">Food Origin</label>
                  <input defaultValue={data.foodOrigin} type="text" name="origin" id="origin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food image url" required />
              </div>
              <div className="sm:col-span-2">
                  <label for="quantity" className="block mb-2 text-sm font-medium text-gray-900 ">Food Quantity</label>
                  <input defaultValue={data.foodQuantity} type='number' name='quantity'  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500  dark:placeholder-gray-400  dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter food  quantity" />
              </div>
              
          </div>
          <button type="submit" className="flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
          Update Food
          </button>
      </form>
  </div>
</section>
        </div>
        </>
    );
};

export default UpdateFood;