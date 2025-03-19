import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaHome, FaRedoAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Logo from "../../assets/Logo.png";

const PageFallback = ({ error, resetError, pageName }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[50vh] flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md"
    >
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mb-6">
        <FaExclamationTriangle className="text-yellow-600 text-4xl" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Error</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We're sorry, but something went wrong while loading{" "}
          {pageName || "this page"}.
        </p>

        {error && error.message && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md max-w-md mx-auto">
            <p className="text-sm text-gray-700 font-mono">{error.message}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mb-6">
        <img src={Logo} alt="Tim's Kitchen" className="h-12 w-12" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <button
          onClick={resetError}
          className="flex-1 py-3 px-6 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center"
        >
          <FaRedoAlt className="mr-2" /> Try Again
        </button>

        <Link to="/" className="flex-1">
          <button className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center justify-center">
            <FaHome className="mr-2" /> Go Home
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

PageFallback.propTypes = {
  error: PropTypes.object,
  resetError: PropTypes.func.isRequired,
  pageName: PropTypes.string,
};

const PageErrorBoundary = ({ children, pageName }) => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <PageFallback
          error={error}
          resetError={resetError}
          pageName={pageName}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

PageErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  pageName: PropTypes.string,
};

export default PageErrorBoundary;
