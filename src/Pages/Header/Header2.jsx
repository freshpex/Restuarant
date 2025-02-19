import React, { useContext, useEffect, useState } from "react";
import { FaTimes, FaStream } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
// import { AuthProvider } from "../AuthContext/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from "../../assets/Logo.png"
import { BsMoonStars ,BsCartCheck,BsSun } from "react-icons/bs";
import { AuthContext } from "../../AuthProvider/AuthProvider";
const Header2 = () => {
    const {user, logOut} = useContext(AuthContext)
  const [nav, setNav] = useState(false);
  // const [show, setShow] = useState(true);
  const [avatar, setAvatar] = useState(false);
  const [toggle, setToggle] = useState(false)
  const [show, setShow] = useState(false)

  const handleToggle = () => {
    setToggle(!toggle)
    
  }
//   const { logOut, user,setUser, loading } = useContext(AuthProvider);
  const navigate = useNavigate();

//   const [theme, setTheme] = useState("light")
//    const element = document.documentElement
//    const darkQuery = window.matchMedia("(prefers-color-scheme : light)")
//   const options = [
//     {
//     icon : "sunny-outline",
//     text : "light"
//   },
//   {
//     icon : "moon-outline",
//     text : "dark"
//   }
// ]

// const onWindowMatch = () => {
//   if(localStorage.theme === "dark" || (!("theme" in localStorage) && darkQuery.matches)
  
//   ){
//     element.classList.add("dark")
//   }
// }

// onWindowMatch()

// useEffect(() => {
//   switch(theme) {
//     case "dark" :
//     element.classList.add("dark")
//     localStorage.setItem("theme", "dark")
//     break

//     case "light" :
//       element.classList.remove("dark")
//       localStorage.setItem("theme", "light")
//       break 

//       default : 
//       localStorage.removeItem("theme")
//       break
//   }
 
// }, [theme])
  
  const handleShow = () => {
    setAvatar((prev) => !prev);
    console.log(!avatar)
  };
  const handleClick = () => {
    setNav((prev) => !prev);
  };
  const handleRemove = () => {
    setShow((prev) => !prev);
  };

  const handleLogOut = () => {
    
    logOut()
      .then(() => {
        
          
          setUser(null )
          window.location.reload()
          // setTimeout(() => {
          //   navigate('/login')
          // }, 2000);
      })
      .catch();

      
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
        
        {/* {user &&  (
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
        {user && (
          <li>
            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `block py-2 pr-4 pl-3 duration-200 ${
                  isActive
                    ? "text-blue-800 underline underline-offset-4"
                    : "text-gray-700 dark:text-gray-600"
                } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-800 lg:p-0`
              }
            >
              Blog
            </NavLink>
          </li>
        )}
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
        </li> */}
      </ul>
      <div className=" hidden gap-5  items-center lg:flex">
        
        

        

        
       
        
        
        
        {user && user?.email ? (
          <>
            <div className="avatar">
              <div
                onClick={handleShow}
                className="w-10  cursor-pointer ring-2 ring-yellow-400 rounded-full"
              >
                <img
                  src={
                    user.photoURL
                      // ? user.photoURL
                      // : "https://i.pinimg.com/originals/ff/a0/9a/ffa09aec412db3f54deadf1b3781de2a.png"
                  }
                />
              </div>
            </div>
            <div
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
              {user.email === "adminsafin@gmail.com"  && <button className="  text-lg border-2 border-gray-100 hover:border-2 hover:bg-indigo-700 hover:border-indigo-700 mb-3 text-indigo-700 hover:text-white  rounded-md py-2 px-4">
                {user.email === "adminsafin@gmail.com" && <NavLink to="/dashboard">Dashboard</NavLink>}
              </button> }
            </div>
            {user && <ul className=" py-3 space-y-3">
                <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/myFood">My Added Food Items</Link>
                </li>
                <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/addFood">Add a Food Item</Link>
                </li>
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

        {/* {user ? (
          ""
        ) : (
          <NavLink to="/register">
            <button className=" px-4 cursor-pointer  border-2 border-indigo-600 active:border-2 active:border-blue-400  py-2 bg-indigo-700 hover:border-2  text-white rounded-md ">
              Get Started
            </button>
          </NavLink>
        )} */}
      </div>

      
      
      {/* mobile */}
      <div className=" lg:hidden flex items-center gap-4">
        
      <div className=" flex lg:hidden ">
      
        {/* <div className="flex items-center  lg:px-5 " >
        { <div className=" " onClick={handleToggle}>
        {!toggle ? <button onClick={() => setTheme("dark")} className=" dark:text-white text-2xl mt-2"><BsMoonStars /></button> : <button onClick={() => setTheme("light")} className=" mt-2 text-black dark:text-white text-2xl"><BsSun/></button> }
        </div>}
        </div> */}
      
    
            
       

        {user && user?.email? (
          ""
        ) : (
          <NavLink to="/register">
            <button className=" lg:flex hidden px-4 cursor-pointer  border-2 border-indigo-600 active:border-2 active:border-blue-400  py-2 bg-indigo-700 hover:border-2  text-white rounded-md ">
              Get Started
            </button>
          </NavLink>
        )}
      </div>
      {/* <div className=" flex items-center">
      {user?.email && <div onClick={handleClick} className=" flex    items-center ">
          <Link to="/shoppingCart" className=" dark:text-white text-black text-2xl cursor-pointer hover:text-indigo-700"><BsCartCheck /></Link>
        </div>}
      </div> */}
      
      <div
        onClick={handleClick}
        className="lg:hidden pt-1 z-10 text-lg dark:text-gray-500 text-gray-700"
      >
        {!nav ? <FaStream /> : <FaTimes />}
      </div>
      </div>
      
      <ul
        className={
          !nav
            ? "hidden"
            : "absolute transition-all duration-500 ease-in-out w-[60%] h-screen top-0 right-0 flex flex-col justify-center items-center bg-slate-100 bg-white rounded-lg dark:bg-slate-900 text-black dark:text-gray-400 "
        }
      >
        <div className=" flex flex-col justify-center items-center pt-6 pb-4">
        {user?.email  &&
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
            <div
              // className=
              //   avatar
              //     ? " rounded-md flex px-4 flex-col gap-2 py-6 dark:bg-slate-800  bg-gray-200  w-80 absolute right-16 top-[74px]"
              //     : "hidden"
              
            >
              <h2 className=" text-sm text-center font-semibold text-gray-800 dark:text-gray-400 pb-2 pt-4 ">Name : {user.displayName}</h2>
              <h2 className=" text-sm  text-center font-semibold  text-gray-800 dark:text-gray-400 pb-4">Email : {user.email}</h2>
              {user.email === "adminsafin@gmail.com"  && <button className="  text-lg border-2 border-gray-100 hover:border-2 hover:bg-indigo-700 hover:border-indigo-700 mb-3 text-indigo-700 hover:text-white  rounded-md py-2 px-4">
                {user.email === "adminsafin@gmail.com" && <NavLink to="/dashboard">Dashboard</NavLink>}
              </button> }
              
              
              
            </div>
          </>
}
        </div>
        <li onClick={handleClick} className="py-2 text-base">
          <Link to="/">Home</Link>
        </li>
        <li onClick={handleClick} className="py-2 text-base">
          <Link to="/aboutUs">About</Link>
        </li>
        <li onClick={handleClick} className="py-2 text-base">
          <Link to="/food">All Food</Link>
        </li>
        <li onClick={handleClick} className="py-2 text-base">
          <Link to="/blog">Blog</Link>
        </li>
        {/* {user?.email && (
          <li onClick={handleClick} className="py-3 text-base">
            <Link to="/event">Latest Events</Link>
          </li>
        )}
        {user?.email && (
          <li onClick={handleClick} className="py-3 text-base">
            <Link to="/blogs">Blog</Link>
          </li>
        )}
        <li onClick={handleClick} className="py-3 text-base">
          <Link to="/contact">Contact Us</Link>
        </li> */}
        {user && <ul className=" py-1 space-y-3">
                <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/myFood">My Added Food Items</Link>
                </li>
                <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/addFood">Add a Food Item</Link>
                </li>
                <li className="text-center border-2 border-white w-full hover:border-2 hover:border-yellow-700 py-3 px-3 rounded-md"> <Link to="/orderFood">My Ordered Food Items</Link>
                </li>
              </ul> }
        
        <div className=" flex flex-col pt-4 gap-5 items-center">
          {user?.email ? <button
                className="text-white   bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-blue-500 font-medium rounded-lg text-sm px-4   py-3 "
                onClick={handleLogOut}
               
              >
                Logout
              </button> :  <Link onClick={handleClick} to="/SignIn">
              <button className=" w-[142px] dark:text-gray-400 cursor-pointer  rounded-md ">
                Login
              </button>
            </Link>}
           
         
          {user?.email ? (
            ""
          ) : (
            <NavLink onClick={handleClick} to="/signup">
              <button className="dark:text-gray-400 px-4 cursor-pointer border  text-gray-900  py-2   rounded-md ">
                Get Started Free
              </button>
            </NavLink>
          )}
          
        </div>
      </ul>
      
    </div>
    </div>
    
  );
};

export default Header2;
