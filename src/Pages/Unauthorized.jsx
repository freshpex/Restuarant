import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaLock } from "react-icons/fa";

const Unauthorized = () => {
  return (
    <>
      <Helmet>
        <title>Unauthorized | Tim's Kitchen</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <FaLock className="text-red-500 text-6xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only administrators
            can access this area.
          </p>
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className="bg-yellow-700 text-white px-6 py-2 rounded-md hover:bg-yellow-800 transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              to="/food"
              className="text-yellow-700 hover:text-yellow-800 transition-colors"
            >
              Browse Food Menu
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;
