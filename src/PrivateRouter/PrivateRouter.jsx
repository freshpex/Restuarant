import React, { useContext } from 'react';

import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthProvider/AuthProvider';

const PrivateRouter = ({children}) => {
    window.scrollTo(0,0)
   const location = useLocation()
    const {user, isLoading} = useContext(AuthContext)
    
   if(isLoading){
    return <div className=' h-screen flex justify-center items-center'><span className="loading loading-spinner loading-lg"></span>
    </div>
   }
    if(user){
        return children
    }
    return <Navigate state={location.pathname} to="/signIn"></Navigate>
};

export default PrivateRouter;