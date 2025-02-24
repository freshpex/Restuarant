import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header2 from "../Pages/Header/Header2";

const Registration = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [isAuthenticated, error, navigate, dispatch]);

    const handleRegister = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        
        try {
            await dispatch(registerUser({ email, password })).unwrap();
            toast.success('Registration successful');
            navigate('/');
        } catch (error) {
            toast.error(error);
        }
    };

    return (
        <>
            <Helmet><title>Tim's Kitchen | Registration</title></Helmet>
            <Header2 />
            <div className="w-full  relative">
                <img  className="w-full h-[400px]  bg-center bg-cover object-cover" src="https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-black-meat-western-food-banner-background-image_194600.jpg" alt="" />
            </div>
            <div className="brightness-90  absolute w-full top-56    flex  justify-center ">
                <h2 className="text-white text-5xl tracking-widest ">Registration</h2>
            </div>

            <div className=" bg-[#121212]  py-20 lg:py-10">
                <section>
                    <div className="flex flex-col items-center px-6 py-8 mx-auto md:h-[100vh] lg:py-0 my-20">
                        <div className="w-full bg-gray-200 rounded-lg border md:mt-0 sm:max-w-lg xl:p-0  ">
                            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                <h1 className="text-xl font-bold leading-tight tracking-tight text-white py-8 px-4 w-full rounded-md text-center bg-gray-900  md:text-2xl ">
                                    Register Your Account
                                </h1>
                                <form
                                    onSubmit={handleRegister}
                                    className="space-y-4 md:space-y-6"
                                >
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block mb-2 text-base font-medium text-gray-900 "
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="type your name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="photo"
                                            className="block mb-2 text-base font-medium text-gray-900 "
                                        >
                                            Photo URL
                                        </label>
                                        <input
                                            type="text"
                                            name="photo"
                                            id="photo"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="photo url"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block mb-2 text-base font-medium text-gray-900 "
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block mb-2 text-base font-medium text-gray-900"
                                        >
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="password"
                                            required
                                        />
                                    </div>

                                    {error && <h2 className=" text-red-600">{error}</h2>}
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms"
                                                aria-describedby="terms"
                                                type="checkbox"
                                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                                                required
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label for="terms" className="font-light text-gray-900 ">
                                                I accept the{" "}
                                                <a
                                                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                                                    href="#"
                                                >
                                                    Terms and Conditions
                                                </a>
                                            </label>
                                        </div>
                                    </div>
                                    <button className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-4 text-center bg-gray-900 hover:bg-gray-600 dark:focus:ring-primary-800">
                                        Create an account
                                    </button>
                                    <p className="text-sm font-light text-gray-900 ">
                                        Already have an account?{" "}
                                        <Link
                                            to="/signIn"
                                            className="font-medium text-gray-900 hover:underline dark:text-primary-500"
                                        >
                                            Sign In here
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Registration;