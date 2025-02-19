import React, { createContext, useEffect, useState } from 'react';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from '../Firebase/firebase.config';
import axios from 'axios';


export const  AuthContext = createContext(null)

const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null)
    let [isLoading, setLoading] = useState("loading")
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app)
   

    
    const createUser = (email,password) => {
        setLoading(true)
        
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const logIn = (email, password) => {
        setLoading(true)
        
        return signInWithEmailAndPassword(auth, email, password)
    }

    const [toggle,setToggle] = useState(false)
    const handleToggle = () => {
        setToggle(!toggle)
    }

    const logOut = () => {
        setLoading(true)
       
        return signOut(auth)
    }

    const signInWithGoogle = () => {
        setLoading(true)
        
        return  signInWithPopup(auth, provider)
    }

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
           
                setUser(currentUser) 
                
                const userEmail = currentUser?.email || user?.email

                const loggedUser = {email : userEmail}
                
                setLoading(false)
                console.log("create user", currentUser)
                if(currentUser){
                    
                    axios.post(`${import.meta.env.VITE_API}/jwt`,loggedUser, {withCredentials : true})
                    .then(res => {
                        console.log(res.data)
                    })
                }

                else{
                    axios.post(`${import.meta.env.VITE_API}/logout`,loggedUser, {withCredentials : true})
                    .then(res => {
                        console.log(res.data)
                    })  
                }
            
        })

        return () => {
            unSubscribe()
        }
    }, [])

    const userInfo = {
        user,
        setUser,
        createUser,
        logIn,
        logOut,
        isLoading,
        signInWithGoogle,
        handleToggle
    }
    return (
        <AuthContext.Provider value={userInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;