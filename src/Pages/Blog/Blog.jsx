import React from 'react';
import Header2 from '../Header/Header2';
import { Helmet } from 'react-helmet';

const Blog = () => {
    return (
        <>
        {/* <Header2/> */}
        <Helmet>
            <title>Tim's Kitchen | Blog</title>
        </Helmet>
        <div className=' bg-[#121212] lg:px-28 px-4 py-44 flex flex-col gap-10 justify-center items-center'>
            <div className=' bg-gray-900 p-10 lg:w-[900px] rounded-md'>
                <h2 className=' text-gray-200 font-bold text-2xl lg:text-3xl text-center pb-4'>What is one way of Eating</h2>
                <p className=' text-gray-600 lg:text-base text-sm text-center'>One-way eating bljjmokk mjkuvfg hjkl</p>
            </div>
            <div className=' bg-gray-900 p-10 lg:w-[900px] rounded-md'>
                <h2 className=' text-gray-200 font-bold text-2xl lg:text-3xl text-center pb-4'>What is food</h2>
                <p className=' text-gray-600 lg:text-base text-sm text-center'>food, or sweet hjkl ijkoimjk ljkjml mljkol</p>
            </div>
            <div className=' bg-gray-900 p-10 lg:w-[900px] rounded-md'>
                <h2 className=' text-gray-200 font-bold text-2xl lg:text-3xl text-center pb-4'>Different between burger spaghetti and normal food</h2>
                <p className=' text-gray-600 lg:text-base text-sm text-center'>burger and spaghetti are two fundamentally different types of food. jhytvgbhjk ioljkuoli; lonhujkl;l ljim,o;.</p>
            </div>
        </div>
        </>
    );
};

export default Blog;