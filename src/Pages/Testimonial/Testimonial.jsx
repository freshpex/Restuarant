import React, { useEffect } from "react";
import Glide from "@glidejs/glide";

export default function Testimonial() {
  useEffect(() => {
    const slider = new Glide(".glide-05", {
      type: "carousel",
      focusAt: "center",
      perView: 3,
      autoplay: 4000,
      animationDuration: 700,
      gap: 24,
      classNames: {
        nav: {
          active: "[&>*]:bg-wuiSlate-700",
        },
      },
      breakpoints: {
        1024: {
          perView: 4,
        },
        640: {
          perView: 1,
        },
      },
    }).mount();

    return () => {
      slider.destroy();
    };
  }, []);

  return (
    <>
      <div className=" bg-[#121212] flex-col flex gap-4 py-4 justify-center items-center">
        <div className=" flex gap-4 lg:flex-col flex-col items-center ">
          <div className=" rounded-md w-10 h-1 bg-yellow-700"></div>
          <div>
            <h2 className=" text-white text-lg tracking-widest pb-3">
              Testimonials
            </h2>
          </div>
        </div>
        <div>
          <h2 className=" text-gray-200 pb-16 text-center text-5xl tracking-wider font-bold ">
            What Our visitors say
          </h2>
        </div>
      </div>
      {/*<!-- Component: Carousel with indicators outside --> */}
      <div className="glide-05 relative w-full bg-[#121212] px-6 lg:px-32">
        {/*    <!-- Slides --> */}
        <div className="overflow-hidden" data-glide-el="track">
          <ul className="whitespace-no-wrap flex-no-wrap [backface-visibility: hidden] [transform-style: preserve-3d] [touch-action: pan-Y] [will-change: transform] relative flex w-full overflow-hidden p-0">
            <li className=" text-center rounded-lg lg:border lg:border-gray-800 p-5 ">
              <h2 className=" text-gray-200 text-3xl text-center pb-4 font-bold ">
                The Best Restaurant
              </h2>
              <p className=" text-gray-600">
                The dining experience at Tim's Kitchen Restaurant is
                unparalleled. From the moment you step in, the ambiance exudes
                elegance, and the service is top-notch. The menu is a culinary
                journey, offering an array of exquisite dishes that are both
                visually stunning and delicious. Each bite is a revelation of
                flavors, expertly crafted by their talented chefs. A must-visit
                for any food enthusiast!
              </p>

              <div className=" border border-gray-900 mt-5 mb-5"></div>

              <div className=" flex justify-center items-center gap-3">
                <div>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/face-4.jpg" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className=" text-white">John Cena</h2>
                </div>
              </div>
            </li>
            <li className="  text-center  rounded-lg lg:border lg:border-gray-800 p-5">
              <h2 className=" text-gray-200 text-3xl text-center pb-4 font-bold ">
                Best In This City
              </h2>
              <p className=" text-gray-600">
                Tim's Kitchen is unequivocally the best in the city. From the
                moment you enter, the atmosphere exudes elegance, and the
                service is exceptional. The menu is a culinary masterpiece,
                offering an array of dishes that are as visually stunning as
                they are delicious. Each bite is an explosion of flavor, a
                testament to the chef's expertise. A must-visit for all food
                enthusiasts!
              </p>

              <div className=" border border-gray-900 mt-5 mb-5"></div>

              <div className=" flex justify-center items-center gap-3">
                <div>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className=" text-white">Ben Stokes</h2>
                </div>
              </div>
            </li>
            <li className="  text-center  rounded-lg lg:border lg:border-gray-800 p-5">
              <h2 className=" text-gray-200 text-3xl text-center pb-4 font-bold ">
                It Was A Delicious Food
              </h2>
              <p className=" text-gray-600">
                The food at Tim's Kitchen is nothing short of extraordinary.
                Each dish is a symphony of flavors, expertly crafted and
                beautifully presented. From appetizers to desserts, every bite
                is a delightful surprise. The culinary experience here is a
                testament to the skill and passion of the chefs. A must-visit
                for anyone who appreciates truly delicious food.
              </p>

              <div className=" border border-gray-900 mt-5 mb-5"></div>

              <div className=" flex justify-center items-center gap-3">
                <div>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/face-1.jpg" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className=" text-white">Emma Jonson</h2>
                </div>
              </div>
            </li>
            <li className="  text-center  rounded-lg lg:border lg:border-gray-800 p-5">
              <h2 className=" text-gray-200 text-3xl text-center pb-4 font-bold ">
                I Am Delighted
              </h2>
              <p className=" text-gray-600">
                I am delighted to share my experience at Tim's Kitchen
                Restaurant. From the moment I walked in, the ambiance exuded
                elegance, and the attentive service enhanced my dining pleasure.
                The menu is a culinary masterpiece, with visually stunning and
                delectable dishes. Each bite was a revelation of flavors,
                expertly crafted by the talented chefs. A must-visit for every
                food enthusiast.
              </p>

              <div className=" border border-gray-900 mt-5 mb-5"></div>

              <div className=" flex justify-center items-center gap-3">
                <div>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/face-2.jpg" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className=" text-white">Victoria Cova</h2>
                </div>
              </div>
            </li>
            <li className="  text-center  rounded-lg lg:border lg:border-gray-800 p-5">
              <h2 className=" text-gray-200 text-3xl text-center pb-4 font-bold ">
                I Will Visit Again
              </h2>
              <p className=" text-gray-600">
                I will definitely visit Tim's Kitchen Restaurant again. My
                dining experience was exceptional, from the elegant ambiance to
                the top-notch service. The menu offered a delightful culinary
                journey with visually stunning and delectable dishes. The
                flavors were expertly crafted, leaving me eager to return. It's
                a must-visit for anyone seeking an unforgettable dining
                experience.
              </p>

              <div className=" border border-gray-900 mt-5 mb-5"></div>

              <div className=" flex justify-center items-center gap-3">
                <div>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/face-3.jpg" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className=" text-white">Paul Heymar</h2>
                </div>
              </div>
            </li>
          </ul>
        </div>
        {/*    <!-- Indicators --> */}
        <div
          className="flex w-full items-center justify-center gap-2"
          data-glide-el="controls[nav]"
        >
          <button
            className="group p-4"
            data-glide-dir="=0"
            aria-label="goto slide 1"
          >
            <span className="block h-2 w-2 rounded-full bg-yellow-700 ring-1 ring-slate-700 transition-colors duration-300 focus:outline-none"></span>
          </button>
          <button
            className="group p-4"
            data-glide-dir="=1"
            aria-label="goto slide 2"
          >
            <span className="block h-2 w-2 rounded-full bg-yellow-700 ring-1 ring-slate-700 transition-colors duration-300 focus:outline-none"></span>
          </button>
        </div>
      </div>
      {/*<!-- End Carousel with indicators outside --> */}
    </>
  );
}
