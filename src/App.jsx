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
        path: "/seeFood/:id",
        element: <SeeFood />,
        loader: async ({params}) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API}/foods/${params.id}`);
                if (!res.ok) throw new Error('Failed to fetch food details');
                return res.json();
            } catch (error) {
                console.error('Error loading food:', error);
                return null;
            }
        }
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
         loader: async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API}/purchaseFood`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch orders: ${res.statusText}`);
                }
                
                const data = await res.json();
                return { orders: data, error: null };
            } catch (err) {
                console.error('Error loading purchase orders:', err);
                return { orders: [], error: err.message };
            }
        }
      },
      {
          path : "/update/:id",
          element : <PrivateRouter><UpdateFood /></PrivateRouter>,
          loader: async ({params}) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API}/update/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                
                if (!res.ok) {
                    console.error('Failed to fetch food:', res.status, res.statusText);
                    return null;
                }
                
                return res.json();
            } catch (error) {
                console.error('Error loading food for update:', error);
                return null;
            }
        }
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
