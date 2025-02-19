import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

const Error = () => {
    const error = useRouteError();
    console.log(error)
    const navigate = useNavigate()


    const handleNavigate = () => {
        navigate("/")
    }
    
    return (
        <div className=' h-[80vh] items-center justify-center   flex flex-col'>
            <img  src="https://t4.ftcdn.net/jpg/03/31/16/63/360_F_331166301_ODCC7hJWriefW0POGVcp5obLiQpphLvv.jpg" alt="" />
            <button onClick={handleNavigate} className=' bg-[#183358] text-white px-4 py-2 rounded-md'>Go Home</button>
        </div>
    );
};

export default Error;