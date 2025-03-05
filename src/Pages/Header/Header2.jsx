import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import { selectCurrentUser, selectIsAuthenticated, selectIsAdmin } from '../../redux/selectors';
import { FaTimes, FaStream } from "react-icons/fa";
import { toast } from 'react-toastify';
import Logo from "../../assets/Logo.png";
import { BsMoonStars, BsSun } from "react-icons/bs";
import CartIcon from '../../Components/CartIcon';

const Header2 = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const isCashier = user?.role === 'cashier';
    const isChef = user?.role === 'chef';
    const isManager = user?.role === 'manager';
    const isStaff = isAdmin || isCashier || isChef || isManager;
    const navigate = useNavigate();
    
    const [nav, setNav] = useState(false);
    const [avatar, setAvatar] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [show, setShow] = useState(false);
    
    const mobileNavRef = useRef(null);
    const mobileNavButtonRef = useRef(null);
    const avatarMenuRef = useRef(null);
    const avatarButtonRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (nav && mobileNavRef.current && !mobileNavRef.current.contains(event.target) && 
                mobileNavButtonRef.current && !mobileNavButtonRef.current.contains(event.target)) {
                setNav(false);
            }
            
            // Close avatar dropdown when clicking outside
            if (avatar && avatarMenuRef.current && !avatarMenuRef.current.contains(event.target) &&
                avatarButtonRef.current && !avatarButtonRef.current.contains(event.target)) {
                setAvatar(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [nav, avatar]);

    const handleToggle = () => {
        setToggle(!toggle);
    };

    const handleShow = () => {
        setAvatar((prev) => !prev);
    };

    const handleClick = () => {
        setNav((prev) => !prev);
    };

    const handleRemove = () => {
        setShow((prev) => !prev);
    };

    const handleLogOut = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/signIn');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <div className=" ">
            <div className=" fixed z-50 border-b border-gray-200  bg-white    py-4 rounded-lg w-full    lg:px-28 px-6    dark:border-b   flex justify-between items-center  text-black  ">
                <h2 className="  text-3xl sm:text-3xl md:text-3xl font-bold ">
                    <Link  className="flex gap-2 items-center" to="/">
                        <img className=" w-14 h-14" src={Logo} alt="" />
                        <span className="">Tim's Kitchen </span>
                    </Link>
                </h2>

                <ul className="hidden lg:flex  items-center justify-center font-semibold text-gray-900  text-base space-x-14 pr-10">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-yellow-700  underline-offset-8"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-yellow-800 lg:p-0`
                            }
                        >
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/aboutUs"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-yellow-700  underline-offset-4"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-yellow-800 lg:p-0`
                            }
                        >
                            About
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/food"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-yellow-700  underline-offset-4"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-yellow-800 lg:p-0`
                            }
                        >
                            All Food
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/drink"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-yellow-700  underline-offset-4"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-yellow-800 lg:p-0`
                            }
                        >
                            All Drink
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/blog"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-yellow-700  underline-offset-4"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-yellow-800 lg:p-0`
                            }
                        >
                            Blog
                        </NavLink>
                    </li>
                    
                    {isAuthenticated &&  (
                        <li>
                            <NavLink
                                to="/event"
                                className={({ isActive }) =>
                                    `block py-2 pr-4 pl-3 duration-200 ${
                                        isActive
                                            ? "text-blue-800 underline underline-offset-4"
                                            : "text-gray-700 dark:text-gray-600"
                                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-800 lg:p-0`
                                }
                            >
                                Latest Events
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink
                            to="/track-order"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-yellow-700 underline-offset-4"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-yellow-800 lg:p-0`
                            }
                        >
                            Track Order
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `block py-2 pr-4 pl-3 duration-200 ${
                                    isActive
                                        ? "text-blue-800 underline underline-offset-4"
                                        : "text-gray-700 dark:text-gray-600"
                                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-800 lg:p-0`
                            }
                        >
                            Contact
                        </NavLink>
                    </li>
                </ul>
                <div className="hidden gap-5 items-center lg:flex">
                    <CartIcon />
                    {isAuthenticated && user?.email ? (
                        <>
                            <div className="avatar">
                                <div
                                    ref={avatarButtonRef}
                                    onClick={handleShow}
                                    className="w-10  cursor-pointer ring-2 ring-yellow-400 rounded-full"
                                >
                                    <img
                                        src={
                                            user.photoURL
                                        }
                                    />
                                </div>
                            </div>
                            <div
                                ref={avatarMenuRef}
                                className={`${avatar ? "rounded-md flex flex-col gap-2 py-6 bg-gray-100 dark:bg-slate-800 w-80 px-4 absolute right-36 top-20" : "hidden" }`
                                }
                            >
                                
                                <div>
                                    <div className={`avatar ${avatar ? "flex  justify-center items-center" : "hidden" } pb-2`}>
                                        <div
                                            className="w-16 ring-2  cursor-pointer   rounded-full"
                                        >
                                            <img
                                                src={
                                                    user.photoURL
                                                }
                                            />
                                        </div>
                                    </div>
                                    <h2 className=" pt-3 pb-2 text-md text-center font-semibold  text-gray-800 dark:text-gray-400">Name : {user.displayName}</h2>
                                    <h2 className=" text-md text-center font-semibold pb-4  text-gray-800 dark:text-gray-400">Email : {user.email}</h2>
                                   {isAdmin && (
                                        <>
                                            <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-yellow-700 hover:border-yellow-700 mb-3 text-yellow-700 hover:text-white rounded-md py-2 px-4 w-full">
                                                <NavLink to="/admin">Admin Dashboard</NavLink>
                                            </button>
                                            <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-green-700 hover:border-green-700 mb-3 text-green-700 hover:text-white rounded-md py-2 px-4 w-full">
                                                <NavLink to="/staff/dashboard">Staff Dashboard</NavLink>
                                            </button>
                                        </>
                                        
                                    )}
                                    {isCashier && (
                                        <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-green-700 hover:border-green-700 mb-3 text-green-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/staff/dashboard">Cash Dashboard</NavLink>
                                        </button>
                                    )}
                                    {isChef && (
                                        <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-orange-700 hover:border-orange-700 mb-3 text-orange-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/staff/dashboard">Chef Dashboard</NavLink>
                                        </button>
                                    )}
                                    {isManager && (
                                        <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-blue-700 hover:border-blue-700 mb-3 text-blue-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/staff/dashboard">Manager Dashboard</NavLink>
                                        </button>
                                    )}
                                </div>
                                {isAuthenticated && <ul className=" py-3 space-y-3">
                                    
                                    {isStaff && (
                                    <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/myFood">My Added Food Items</Link>
                                    </li>
                                    )}
                                    {isStaff && (
                                        <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/addFood">Add a Food Item</Link>
                                        </li>
                                    )}
                                    <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/orderFood">My Ordered Food Items</Link>
                                    </li>
                                </ul> }
                                <div className=" w-full" onClick={handleRemove}>
                                    <button
                                        className="text-black dark:text-gray-400 text-lg border-2 hover:border-2 hover:bg-yellow-600 hover:text-white border-yellow-700 mb-3  rounded-md w-full py-2 px-4"
                                        onClick={handleLogOut}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/signIn"
                            className=" bg-yellow-700 hover:text-black border-2 border-yellow-600 text-gray-800 dark:text-gray-400 hover:border-2  lg:mr-3 focus:ring-4 focus:ring-yellow-300  rounded-lg text-sm px-4 lg:px-6 py-3 tracking-widest font-semibold lg:py-2.5 mr-2 focus:outline-none"
                        >
                            Login
                        </Link>
                    )}
                </div>

                <div className=" lg:hidden flex items-center gap-4">
                    <CartIcon />
                    <div className=" flex lg:hidden ">
                        {isAuthenticated && user?.email? (
                            ""
                        ) : (
                            <NavLink to="/register">
                                <button className=" lg:flex hidden px-4 cursor-pointer  border-2 border-indigo-600 active:border-2 active:border-blue-400  py-2 bg-indigo-700 hover:border-2  text-white rounded-md ">
                                    Get Started
                                </button>
                            </NavLink>
                        )}
                    </div>
                    <div
                        ref={mobileNavButtonRef}
                        onClick={handleClick}
                        className="lg:hidden pt-1 z-10 text-lg dark:text-gray-500 text-gray-700"
                    >
                        {!nav ? <FaStream /> : <FaTimes />}
                    </div>
                </div>
                
                <div
                    ref={mobileNavRef}
                    className={
                        !nav
                            ? "hidden"
                            : "absolute transition-all duration-500 ease-in-out w-[60%] h-screen top-0 right-0 flex flex-col justify-center items-center bg-slate-100 bg-white rounded-lg dark:bg-slate-900 text-black dark:text-gray-400 "
                    }
                >
                    <div className=" flex flex-col justify-center items-center pt-6 pb-4">
                        {isAuthenticated && user?.email  &&
                            <>
                                <div className="avatar">
                                    <div
                                        className="w-14 cursor-pointer rounded-full ring-2 ring-yellow-400"
                                    >
                                        <img
                                            src={
                                                user?.photoURL
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h2 className=" text-sm text-center font-semibold text-gray-800 dark:text-gray-400 pb-2 pt-4 ">Name : {user.displayName}</h2>
                                    <h2 className=" text-sm  text-center font-semibold  text-gray-800 dark:text-gray-400 pb-4">Email : {user.email}</h2>
                                    {isAdmin && (                                        
                                         <>
                                         <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-yellow-700 hover:border-yellow-700 mb-3 text-yellow-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/admin" onClick={() => setNav(false)}>Admin Dashboard</NavLink>
                                        </button>
                                         <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-green-700 hover:border-green-700 mb-3 text-green-700 hover:text-white rounded-md py-2 px-4 w-full">
                                             <NavLink to="/staff/dashboard">Staff Dashboard</NavLink>
                                         </button>
                                     </>
                                    )}
                                    {isCashier && (
                                        <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-green-700 hover:border-green-700 mb-3 text-green-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/staff/dashboard" onClick={() => setNav(false)}>Cash Dashboard</NavLink>
                                        </button>
                                    )}
                                    {isChef && (
                                        <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-orange-700 hover:border-orange-700 mb-3 text-orange-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/staff/dashboard" onClick={() => setNav(false)}>Chef Dashboard</NavLink>
                                        </button>
                                    )}
                                    {isManager && (
                                        <button className="text-lg border-2 border-gray-100 hover:border-2 hover:bg-blue-700 hover:border-blue-700 mb-3 text-blue-700 hover:text-white rounded-md py-2 px-4 w-full">
                                            <NavLink to="/staff/dashboard" onClick={() => setNav(false)}>Manager Dashboard</NavLink>
                                        </button>
                                    )}
                                </div>
                            </>
                        }
                    </div>
                    <ul>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/">Home</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/aboutUs">About</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/food">All Food</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/drink">All Drinks</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/event">Events</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/track-order">Track Order</Link>
                        </li>
                        <li onClick={() => setNav(false)} className="py-2 text-base">
                            <Link to="/contact">Contacts</Link>
                        </li>
                        {isAuthenticated && <ul className=" py-1 space-y-3">
                            
                            {isStaff && (
                            <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/myFood" onClick={() => setNav(false)}>My Added Food Items</Link>
                            </li>
                            )}
                            {isStaff && (
                                <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/addFood" onClick={() => setNav(false)}>Add a Food Item</Link>
                                </li>
                            )}
                            <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/orderFood" onClick={() => setNav(false)}>My Ordered Food Items</Link>
                            </li>
                        </ul> }
                    </ul>
                    
                    <div className=" flex flex-col pt-4 gap-5 items-center">
                        {isAuthenticated && user?.email ? <button
                            className="text-white   bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-blue-500 font-medium rounded-lg text-sm px-4   py-3 "
                            onClick={handleLogOut}
                        >
                            Logout
                        </button> :  <Link onClick={handleClick} to="/SignIn">
                            <button className=" w-[142px] dark:text-gray-400 cursor-pointer  rounded-md ">
                                Login
                            </button>
                        </Link>}
                        
                        {isAuthenticated && user?.email ? (
                            ""
                        ) : (
                            <NavLink onClick={handleClick} to="/signup">
                                <button className="dark:text-gray-400 px-4 cursor-pointer border  text-gray-900  py-2   rounded-md ">
                                    Get Started Free
                                </button>
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header2;
