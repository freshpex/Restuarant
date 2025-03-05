import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebase.config.js';
import Layout from "./MainLayout/Layout";
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
import TopSelling from "./Pages/TopSelling/TopSelling";
import TopFood from "./Pages/TopSelling/TopFood";
import Error from "./Error/Error";
import { Toaster } from "react-hot-toast";
import { stopGlobalLoading } from './redux/slices/uiSlice';
import GlobalLoadingSpinner from './Components/GlobalLoadingSpinner';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { getSerializableUser } from './utils/userUtils';
import { setCredentials, clearCredentials, fetchUserProfile } from './redux/slices/authSlice';
import { checkTokenValidity } from './utils/authUtils';
import AdminRoute from './Components/AdminRoute';
import Unauthorized from './Pages/Unauthorized';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import UserManagement from './Pages/Admin/UserManagement';
import RoleDebugger from './Components/RoleDebugger';
import Dashboard from './Pages/Admin/Dashboard';
import FoodManagement from './Pages/Admin/FoodManagement';
import OrderManagement from './Pages/Admin/OrderManagement';
import Analytics from './Pages/Admin/Analytics';
import TermsAndConditions from './Pages/Terms/TermsAndConditions';
import Cart from './Pages/Cart/Cart';
import Checkout from './Pages/Cart/Checkout';
import OrderSuccess from './Pages/Cart/OrderSuccess';
import Contact from "./Pages/Contact/Contact";
import Events from "./Pages/Events/Events";
import OrderTracking from './Pages/OrderTracking/OrderTracking';
import StaffRoute from './Components/StaffRoute';
import StaffDashboard from './Pages/Staff/StaffDashboard';
import StaffOrders from './Pages/Staff/StaffOrders';
import StaffFoods from './Pages/Staff/StaffFoods';
import StaffAddOrder from './Pages/Staff/StaffAddOrder';
import StaffActivities from './Pages/Admin/StaffActivities';
import RawMaterials from './Pages/Admin/RawMaterials.jsx';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!checkTokenValidity()) {
            dispatch(clearCredentials());
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const serializedUser = getSerializableUser(user);
                try {
                    const token = await user.getIdToken(true);
                    localStorage.setItem('token', token);
                    dispatch(setCredentials({
                        user: serializedUser,
                        token
                    }));
                    
                    dispatch(fetchUserProfile());
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    dispatch(clearCredentials());
                }
            } else {
                dispatch(clearCredentials());
            }
            dispatch(stopGlobalLoading());
        });

        return () => unsubscribe();
    }, [dispatch]);

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            errorElement: <Error />,
            children: [
                {
                    path: '/',
                    element: <Hero />
                },
                {
                    path: "/about",
                    element: <About />
                },
                {
                    path: "/aboutUs",
                    element: <AboutUs />
                },
                {
                    path: "/food",
                    element: <Food />
                },
                {
                    path: "/seeFood/:id",
                    element: <SeeFood />
                },
                {
                    path: "/topFood/:id",
                    element: <TopFood />
                },
                {
                    path: "/foodOrder/:id",
                    element: <PrivateRouter><FoodOrder /></PrivateRouter>
                },
                {
                    path: "/myFood",
                    element: <PrivateRouter><MyFood /></PrivateRouter>
                },
                {
                    path: "/addFood",
                    element: <PrivateRouter><AddFood /></PrivateRouter>
                },
                {
                    path: "/orderFood",
                    element: <PrivateRouter><OrderFood /></PrivateRouter>
                },
                {
                    path: "/update/:id",
                    element: <PrivateRouter><UpdateFood /></PrivateRouter>
                },
                {
                    path: "/topSelling",
                    element: <TopSelling />
                },
                {
                    path: "/blog",
                    element: <Blog />
                },
                {
                    path: "/signup",
                    element: <Registration />
                },
                {
                    path: "/signIn",
                    element: <SignIn />
                },
                {
                    path: "/unauthorized",
                    element: <Unauthorized />
                },
                {
                    path: "/termsandcondition",
                    element: <TermsAndConditions />
                },
                {
                    path: "/contact",
                    element: <Contact />
                },
                {
                    path: "/event",
                    element: <Events />
                },
                {
                    path: "/cart",
                    element: <Cart />
                },
                {
                    path: "/checkout",
                    element: <Checkout />
                },
                {
                    path: "/order-success",
                    element: <OrderSuccess />
                },
                {
                    path: "/track-order",
                    element: <PrivateRouter><OrderTracking /></PrivateRouter>
                },
                {
                    path: "/track-order/:orderId",
                    element: <OrderTracking />
                }
            ]
        },
        {
            path: '/admin',
            element: <AdminRoute><AdminDashboard /></AdminRoute>,
            children: [
                {
                    index: true,
                    element: <Dashboard />
                },
                {
                    path: 'users',
                    element: <UserManagement />
                },
                {
                    path: 'foods',
                    element: <FoodManagement />
                },
                {
                    path: 'orders',
                    element: <OrderManagement />
                },
                {
                    path: 'analytics',
                    element: <Analytics />
                },
                {
                    path: 'staff-activities',
                    element: <StaffActivities />
                },
                {
                    path: "material",
                    element: <RawMaterials />
                },
                {
                    path: 'add-order',
                    element: <StaffAddOrder />
                },
            ]
        },
        {
            path: '/staff',
            element: <StaffRoute />,
            children: [
                {
                    path: 'dashboard',
                    element: <StaffDashboard />
                },
                {
                    path: 'orders',
                    element: <StaffOrders />
                },
                {
                    path: 'foods',
                    element: <StaffFoods />
                },
                {
                    path: 'add-order',
                    element: <StaffAddOrder />
                },
                {
                    path: "material",
                    element: <RawMaterials />
                },
            ]
        }
    ]);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <GlobalLoadingSpinner />
                <RouterProvider router={router} />
                <Toaster />
                {/* {process.env.NODE_ENV !== 'production' && <RoleDebugger />} */}
            </PersistGate>
        </Provider>
    );
}

export default App;
