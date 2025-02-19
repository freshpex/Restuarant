import React, { useEffect, useState } from 'react';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';
import AllFoodCard from './AllFoodCard';
import { useLoaderData } from 'react-router-dom';
import {AiOutlineRight,AiOutlineLeft} from "react-icons/ai"
const Food = () => {
    // window.scrollTo(0,0)

    const [search,setSearch] = useState([])
     const [display,setDisplay] = useState([])
    const [filter, setFilter] = useState([])
    const [foodPerPage, setPage] = useState(9)
    const [current, setCurrent] = useState(0)
    
    const {count} = useLoaderData()
    console.log(count)


    const numberOfPage = Math.max(1, Math.ceil(count / foodPerPage));
     const page = [...Array(numberOfPage).keys()];

    console.log(page)

    const handlePrev = () => {
        if(current > 0){
            setCurrent(current - 1)
        }
    }

    const handleNext = () => {
        if(current < page.length -1){
            setCurrent(current + 1)
        }
    }

    const handlePage = (e) => {
        setPage(parseInt(e.target.value))
        setCurrent(1)
    }

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API}/foods?page=${current}&size=${foodPerPage}`)
        .then(res => res.json())
        .then(data => {
            setSearch(data);
            setFilter(data);
        });
    }, [current, foodPerPage]);

    
    const handleSearch = () => {
        if (display === '') {
            setFilter(search);
        } else {
            const filteredData = search.filter(item => item.foodName === display);
            setFilter(filteredData);
        }
    }
    return (
        <>
        <Header2 />
        <Helmet>
            <title>Tim's Kitchen | All-Food</title>
        </Helmet>
        <div className=' bg-[#121212]   w-full h-screen relative'>
            
            <img className='w-full  brightness-75  mx-auto h-[60%] my-auto bg-center bg-cover object-cover'  src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/gallery-i-6.jpg" alt="" />
            <div class="absolute inset-0"></div>
            <div className=' absolute w-full top-0 left-0 h-full'>

                <div className='   inset-0 absolute -top-52    flex flex-col gap-10 justify-center items-center text-black  w-full p-5 '>
                     <div className=" flex gap-4 lg:flex-col flex-col items-center ">
                        </div>
                    <h2 className=' text-3xl lg:text-5xl text-white font-bold'>Search Your Food</h2>
                    <div    className=' max-w-[700px] mx-auto w-full flex justify-center items-center' action="">
                        <div className=' lg:w-[350px]'>
                            <input onChange={(e) => setDisplay(e.target.value)}    className=' border-2 py-3 w-full border-white text-gray-700 rounded-tl-lg rounded-bl-lg  px-4' type="text"  name="text" id="" placeholder='search your food...' />
                        </div>

                        <div className=' relative right-3'>
                            <button onClick={handleSearch}   className=' rounded-tr-lg tracking-wider font-se  rounded-br-lg font-semibold bg-yellow-700  px-5 py-3.5  text-gray-900  '>Search</button>
                        </div>
                    </div>
                </div>
               
            </div>
        </div>
        <div className=' bg-[#121212] -mt-40 pb-20 lg:px-28 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            {filter.map(data => <AllFoodCard key={data._id} data={data} />)}
        </div>

        
        {/* <h2 className='text-white bg-black text-center pb-3'>Current page {current}</h2> */}
        <div className=' bg-[#121212] flex justify-center items-center pb-20 text-center text-white'>
        
            <button className='px-3 mx-2 rounded-md border py-2  bg-[#121212] text-white' onClick={handlePrev}><AiOutlineLeft /></button>
           {page.map(pages => <button onClick={() => setCurrent(pages)} key={pages} className={`mx-2 px-3 rounded-md border py-1  bg-[#121212] text-white ${current === pages && "bg-yellow-800 text-white"}`}>{pages +1}</button>)}
           <button className='px-3 rounded-md border py-2 mx-2  bg-[#121212] text-white' onClick={handleNext}><AiOutlineRight /></button>
           <select className='text-black hidden'  value={foodPerPage} onChange={handlePage} name="" id="">
                    <option  value={2}>2</option>
                    
                </select>
        </div>
        </>
    );
};

export default Food;