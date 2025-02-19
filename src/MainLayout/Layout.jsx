import React from 'react';
import Header from '../Pages/Header/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../Pages/Footer/Footer';
import Header2 from '../Pages/Header/Header2';

const Layout = () => {
    return (
        <div>
            {/* <Header2 /> */}
            <Outlet />
            <Footer />
        </div>
    );
};

export default Layout;