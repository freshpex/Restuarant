import React from "react";
import Header2 from "../Pages/Header/Header2";
import { Helmet } from "react-helmet";
import About from "../Pages/About/About";
import Team from "../Pages/Team/Team";
import Testimonial from "../Pages/Testimonial/Testimonial";
const AboutUs = () => {
  window.scrollTo(0, 0);
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | About</title>
      </Helmet>
      <Header2></Header2>
      <div className=" pt-20">
        <About />
        <Team />
        <Testimonial />
      </div>
    </>
  );
};

export default AboutUs;
