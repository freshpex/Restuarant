import React from "react";
import { Link } from "react-router-dom";
import { TiTick } from "react-icons/ti";

const About = () => {
  window.scrollTo(0, 0);
  return (
    <div className=" bg-[#121212] lg:gap-2 gap-12 lg:px-20 px-6   flex flex-col-reverse lg:flex-row-reverse justify-around lg:py-0 py-20 lg:h-screen items-center">
      <div className=" ">
        <button className=" font-mono text-lg tracking-widest text-yellow-700 font-bold mb-4">
          ABOUT US
        </button>
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-300 dark:text-gray-400">
          Welcome to <br /> Tim's Kitchen Restaurant
        </h2>
        <p className=" text-gray-400 dark:text-gray-500 lg:w-[500px] pt-6 pb-6">
          A Culinary Journey Beyond Taste. Discover our passion for exceptional
          dining, quality, and unforgettable experiences. Explore more.
        </p>
        <div className=" flex lg:flex-row gap-4 pb-8 pt-3 ">
          <div className=" flex gap-4 items-center">
            <img
              className=" w-10"
              src="https://cafeu.vercel.app/img/icon/3-7.png"
              alt=""
            />
            <div>
              <h2 className=" text-yellow-700 font-semibold text-lg">
                Rating Star
              </h2>
              <p className=" text-sm lg:w-[200px] text-gray-300">
                A five-star dining experience that delights every palate.
              </p>
            </div>
          </div>

          <div className=" flex gap-4 items-center">
            <img
              className="w-10"
              src="https://cafeu.vercel.app/img/icon/3-7.png"
              alt=""
            />
            <div>
              <h2 className=" text-yellow-700 font-semibold text-lg">
                Free species
              </h2>
              <p className=" text-sm lg:w-[200px] text-gray-300">
                Explore diverse flavors through our unique fusion cuisine.
              </p>
            </div>
          </div>
        </div>
        <Link to="/aboutUs">
          <button className=" bg-yellow-700 text-gray-900 px-6 py-3 rounded-lg mt-3 tracking-widest font-semibold ">
            {" "}
            About More
          </button>
        </Link>
      </div>
      <div>
        <img src="https://cafeu.vercel.app/img/about/3-about.png" alt="" />
      </div>
    </div>
  );
};

export default About;
