import News from "../../NewsLetter/News";
import About from "../About/About";
import Header from "../Header/Header";
// import Header2 from "../Header/Header2";
import Team from "../Team/Team";
import {Helmet} from "react-helmet";
import Testimonial from "../Testimonial/Testimonial";
import { Link } from "react-router-dom";
import TopSelling from "../../TopSelling/TopSelling";

const Hero = () => {
    return (
        <>
        <Helmet>
            <title>Tim's Kitchen | Home</title>
        </Helmet>
        {/* <Header /> */}
        <div className=' w-full h-screen relative'>
            
            <img className='w-full h-full bg-center bg-cover object-cover'  src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/home-slide-1.jpg" alt="" />
            
            <div className='   absolute w-full top-0 left-0 h-full'>

                <div className=' absolute  flex flex-col gap-7 justify-center   h-full w-full px-6 lg:px-40 pt-7 '>
                    <div className=" flex gap-4 lg:flex-row flex-col items-center ">
                        <div className=" rounded-md w-10 h-1 bg-yellow-700">

                        </div>
                        <div>
                            <h2 className=" text-white tracking-wider">Hello, New Friend</h2>
                        </div>
                    </div>
                    <h2 className=' text-center lg:text-left mx-auto lg:mx-0  w-[350px] tracking-wider text-5xl lg:text-7xl text-white font-bold lg:w-[570px]'>Welcome Back
                    to Tim's Kitchen</h2>

                    <p className=" tracking-wider text-white text-center lg:text-left lg:w-[340px] py-2">
                    Savor burger-pizza set menus, a delightful fusion of flavors. Explore our irresistible creations for a tantalizing dining experience
                    </p>

                    <div className=" flex gap-4 items-center justify-center lg:justify-start pt-2">
                        <Link to="/food"><button className=" px-5 py-4 rounded-lg tracking-widest bg-yellow-800 font-semibold text-base text-gray-900 hover:scale-105 duration-500 ease-in-out">Order Now</button></Link>
                        <Link to="/signup"><button className=" px-5 py-4 rounded-lg tracking-widest hover:bg-yellow-800 font-semibold text-base text-white hover:scale-105 duration-500 ease-in-out">Book Now</button></Link>
                    </div>
                    
                </div>
               
            </div>
        </div>
       <About />
       <TopSelling />
       <Team />
         <Testimonial />
       <News />
        </>
    );
};

export default Hero;