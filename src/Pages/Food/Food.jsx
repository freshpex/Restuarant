import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoods, setCurrentPage } from '../../redux/slices/foodSlice';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import AllFoodCard from './AllFoodCard';
import {AiOutlineRight,AiOutlineLeft} from "react-icons/ai";
import LoadingSpinner from '../../Components/LoadingSpinner';

const Food = () => {
    const dispatch = useDispatch();
    const { foods, loading, error, currentPage } = useSelector(state => state.food);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const [foodPerPage] = useState(9);

    useEffect(() => {
        dispatch(fetchFoods({ page: currentPage, size: foodPerPage }));
    }, [dispatch, currentPage, foodPerPage]);

    useEffect(() => {
        setFilter(foods);
    }, [foods]);

    const handlePrev = () => {
        if (currentPage > 0) {
            dispatch(setCurrentPage(currentPage - 1));
        }
    };

    const handleNext = () => {
        dispatch(setCurrentPage(currentPage + 1));
    };

    const handleSearch = () => {
        if (search === '') {
            setFilter(foods);
        } else {
            const filteredData = foods.filter(item => 
                item.foodName.toLowerCase().includes(search.toLowerCase())
            );
            setFilter(filteredData);
        }
    };

    return (
        <>
            {/* <Header2 /> */}
            <Helmet>
                <title>Tim's Kitchen | All-Food</title>
            </Helmet>
            <div className=' bg-[#121212]   w-full h-screen relative'>
            
            <img className='w-full  brightness-75  mx-auto h-[60%] my-auto bg-center bg-cover object-cover'  src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/gallery-i-6.jpg" alt="" />
            <div className="absolute inset-0"></div>
            <div className=' absolute w-full top-0 left-0 h-full'>

                <div className='   inset-0 absolute -top-52    flex flex-col gap-10 justify-center items-center text-black  w-full p-5 '>
                     <div className=" flex gap-4 lg:flex-col flex-col items-center ">
                        </div>
                    <h2 className=' text-3xl lg:text-5xl text-white font-bold'>Search Your Food</h2>
                    <div    className=' max-w-[700px] mx-auto w-full flex justify-center items-center' action="">
                        <div className=' lg:w-[350px]'>
                            <input onChange={(e) => setSearch(e.target.value)} value={search} className=' border-2 py-3 w-full border-white text-gray-700 rounded-tl-lg rounded-bl-lg  px-4' type="text"  name="text" id="" placeholder='search your food...' />
                        </div>

                        <div className=' relative right-3'>
                            <button onClick={handleSearch}   className=' rounded-tr-lg tracking-wider font-se  rounded-br-lg font-semibold bg-yellow-700  px-5 py-3.5  text-gray-900  '>Search</button>
                        </div>
                    </div>
                </div>
               
            </div>
        </div>
        <div className=' bg-[#121212] -mt-40 pb-20 lg:px-28 px-6'>
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="text-red-500 text-center py-10">
                    Error: {error}
                </div>
            ) : filter.length === 0 ? (
                <div className="text-white text-center py-10">
                    No foods found. Try a different search.
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                    {filter.map(data => <AllFoodCard key={data._id} data={data} />)}
                </div>
            )}
        </div>

        
        {/* <h2 className='text-white bg-black text-center pb-3'>Current page {current}</h2> */}
        <div className=' bg-[#121212] flex justify-center items-center pb-20 text-center text-white'>
        
            <button className='px-3 mx-2 rounded-md border py-2  bg-[#121212] text-white' onClick={handlePrev}><AiOutlineLeft /></button>
           {[...Array(Math.ceil(foods.length / foodPerPage)).keys()].map(pages => <button onClick={() => dispatch(setCurrentPage(pages))} key={pages} className={`mx-2 px-3 rounded-md border py-1  bg-[#121212] text-white ${currentPage === pages && "bg-yellow-800 text-white"}`}>{pages +1}</button>)}
           <button className='px-3 rounded-md border py-2 mx-2  bg-[#121212] text-white' onClick={handleNext}><AiOutlineRight /></button>
           <select className='text-black hidden'  value={foodPerPage} onChange={(e) => dispatch(setCurrentPage(parseInt(e.target.value)))} name="" id="">
                    <option  value={2}>2</option>
                    
                </select>
        </div>
        </>
    );
};

export default Food;