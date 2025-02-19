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
       
        return signOut(auth).catch(error => {
            console.error("Logout error:", error.message)
            setLoading(false)
        })
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
            
            console.log("Auth state changed")
            
            if(currentUser){
                axios.post(`${import.meta.env.VITE_API}/jwt`, loggedUser, {
                    withCredentials: true
                })
                .then(res => {
                    if(res.data.success) {
                        console.log("JWT token created successfully")
                    }
                })
                .catch(error => {
                    console.error("JWT creation error:", error.message)
                })
            } else {
                axios.post(`${import.meta.env.VITE_API}/logout`, loggedUser, {
                    withCredentials: true
                })
                .then(res => {
                    if(res.data.success) {
                        console.log("Logged out successfully")
                    }
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