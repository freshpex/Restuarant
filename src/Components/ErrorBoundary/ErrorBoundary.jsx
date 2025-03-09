import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBug, FaHome, FaRedoAlt, FaExclamationTriangle } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from "../../assets/Logo.png";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorStack: '',
      displayStack: false,
      isLoading: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo, errorStack: error.stack });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  handleResetError = () => {
    this.setState({ isLoading: true });
    
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isLoading: false 
      });
      
      if (this.props.onReset) {
        this.props.onReset();
      }
    }, 1000);
  }

  toggleErrorStack = () => {
    this.setState(prevState => ({
      displayStack: !prevState.displayStack
    }));
  }

  render() {
    const { hasError, error, errorStack, displayStack, isLoading } = this.state;
    const { fallback, children } = this.props;
    
    // If there's a custom fallback component, use it
    if (hasError && fallback) {
      return typeof fallback === 'function' 
        ? fallback(error, this.handleResetError)
        : fallback;
    }
    
    if (hasError) {
      return (
        <AnimatePresence>
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-white mr-2 text-xl" />
                  <h2 className="text-white font-bold text-xl">Something went wrong</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: isLoading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                  >
                    <FaRedoAlt className="text-white text-xl" />
                  </motion.div>
                </div>
              </div>
              
              {/* Error message */}
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="mr-4 flex-shrink-0">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 5
                      }}
                    >
                      <FaBug className="text-red-500 text-4xl" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {error?.message || 'An unexpected error occurred'}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Don't worry, this doesn't affect your data. Let us know if this keeps happening.
                    </p>
                  </div>
                </div>
                
                {/* Tim's Kitchen branding */}
                <div className="flex justify-center mb-6">
                  <div className="flex flex-col items-center">
                    <img src={Logo} alt="Tim's Kitchen" className="h-16 w-16" />
                    <p className="text-sm text-gray-500 mt-2">Tim's Kitchen</p>
                  </div>
                </div>

                {/* Error details collapsible section */}
                {errorStack && (
                  <div className="mb-6">
                    <button 
                      onClick={this.toggleErrorStack}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {displayStack ? 'Hide' : 'Show'} technical details
                    </button>
                    
                    <AnimatePresence>
                      {displayStack && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <pre className="mt-3 p-4 bg-gray-100 rounded-md text-xs text-gray-800 overflow-x-auto max-h-60">
                            {errorStack}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={this.handleResetError}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg font-medium flex justify-center items-center transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <FaRedoAlt />
                        </motion.div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <FaRedoAlt className="mr-2" /> Try Again
                      </>
                    )}
                  </motion.button>
                  
                  <Link to="/" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium flex justify-center items-center"
                    >
                      <FaHome className="mr-2" /> Go Home
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Support text */}
            <p className="text-gray-500 text-sm mt-6 text-center">
              If this problem persists, please contact our support team. <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a>
            </p>
          </div>
        </AnimatePresence>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  onReset: PropTypes.func
};

export default ErrorBoundary;
