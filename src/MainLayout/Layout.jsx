import React from 'react';
import Header from '../Pages/Header/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../Pages/Footer/Footer';
import Header2 from '../Pages/Header/Header2';
import RouteChangeHandler from '../Components/RouteChangeHandler';

const Layout = () => {
    return (
        <div>
            <RouteChangeHandler />
            {/* <Header2 /> */}
            <Outlet />
            <Footer />
        </div>
    );
};

export default Layout;