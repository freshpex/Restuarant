import React from 'react';

const News = () => {
    return (
        <div className=' bg-[#121212]  pt-36 w-full h-screen relative'>
            
            <img className='w-[83%] rounded-lg brightness-75  mx-auto h-[80%] my-auto bg-center bg-cover object-cover'  src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/gallery-i-6.jpg" alt="" />
            <div class="absolute inset-0"></div>
            <div className=' absolute w-full top-0 left-0 h-full'>

                <div className='   inset-0 absolute top-0    flex flex-col gap-10 justify-center items-center text-black h-full w-full p-5 '>
                     <div className=" flex gap-4 lg:flex-col flex-col items-center ">
                        <div className=" rounded-md w-10 h-1 bg-yellow-700">

                        </div>
                        <div>
                            <h2 className=" text-white tracking-wider font-semibold text-lg"> News Letter</h2>
                        </div>
                        </div>
                    <h2 className=' text-3xl lg:text-5xl text-white font-bold'>Subscribe our newsletter</h2>
                    <div    className=' max-w-[700px] mx-auto w-full flex justify-center items-center' action="">
                        <div className=' lg:w-[350px]'>
                            <input    className=' border-2 py-3 w-full border-white text-gray-700 rounded-tl-lg rounded-bl-lg  px-4' type="text"  name="text" id="" placeholder='Enter your email Here...' />
                        </div>

                        <div className=' relative right-3'>
                            <button   className=' rounded-tr-lg tracking-wider font-se  rounded-br-lg font-semibold bg-yellow-700  px-5 py-3.5  text-gray-900  '>Subscribe</button>
                        </div>
                    </div>
                </div>
               
            </div>
        </div>
    );
};

export default News;