import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Layout from "./MainLayout/Layout";
import AuthProvider from "./AuthProvider/AuthProvider";
import Registration from "./Registration/Registration";
import SignIn from "./SignIN/SignIn";
import Hero from "./Pages/Home/Hero";
import About from "./Pages/About/About";
import AboutUs from "./AboutUs/AboutUs";
import Food from "./Pages/Food/Food";
import Blog from "./Pages/Blog/Blog";
import SeeFood from "./Pages/SeeFood/SeeFood";
import PrivateRouter from "./PrivateRouter/PrivateRouter";
import FoodOrder from "./Pages/FoodOrder/FoodOrder";
import MyFood from "./Pages/AddFood/MyFood";
import OrderFood from "./Pages/AddFood/OrderFood";
import AddFood from "./Pages/AddFood/AddFood";
import UpdateFood from "./Pages/UpdateFood/UpdateFood";
import TopSelling from "./TopSelling/TopSelling";
import TopFood from "./TopSelling/TopFood";
import Error from "./Error/Error";
import { Toaster } from "react-hot-toast";
function App() {
 
  const router = new createBrowserRouter(
    [{
     path : '/',
     element : <Layout />,
    errorElement : <Error />,

     children : [ 
      {
          path : '/',
          element : <Hero />
      },
      {
         path : "/about",
         element : <About />
      },
      {
        path : "/aboutUs",
        element : <AboutUs />
      },
      {
           path : "/food",
           element : <Food />,
           loader : () => fetch(`${import.meta.env.VITE_API}/foodCount`)
      },
      {
        path : "/seeFood/:id",
        element :  <SeeFood />,
        loader : ({params}) => fetch(`${import.meta.env.VITE_API}/${params.id}`)
      },
      {
         path : "/topFood/:id",
         element : <TopFood />,
         loader : ({params}) => fetch(`${import.meta.env.VITE_API}/${params.id}`)
      },
      {
            path : "/foodOrder/:id",
            element : <PrivateRouter><FoodOrder /></PrivateRouter>,
            loader : ({params}) => fetch(`${import.meta.env.VITE_API}/${params.id}`)
      },
      {
         path : "/myFood",
         element : <PrivateRouter><MyFood /></PrivateRouter>,
         loader : () => fetch("${import.meta.env.VITE_API}/addFood")
      },
      {
         path : "/addFood",
         element : <PrivateRouter><AddFood /></PrivateRouter>,
        
      },
      {
         path : "/orderFood",
         element : <PrivateRouter><OrderFood /></PrivateRouter>,
         loader : () =>  fetch(`${import.meta.env.VITE_API}/purchaseFood`)
      },
      {
          path : "/update/:id",
          element : <PrivateRouter><UpdateFood /></PrivateRouter>,
          loader : ({params}) => fetch(`${import.meta.env.VITE_API}/update/${params.id}`)
      },
      {
        path : "/topSelling",
        element : <TopSelling />,
        loader : () => fetch("${import.meta.env.VITE_API}/topSellingFoods")
      },
      {
        path : "/blog",
        element : <Blog />
      },
      {
        path : "/signup",
        element : <Registration />
      },
      {
        path : "/signIn",
        element : <SignIn />
      }
     ]


  }
])

  return (

    <>
    <AuthProvider>
    <RouterProvider router={router}>
      
    </RouterProvider>
    
    </AuthProvider>
    <Toaster />
    </>
  )
}

export default App
