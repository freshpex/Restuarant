import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight, FaShoppingCart, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { checkDomainAvailability, calculatePriceWithMarkup } from '../utils/domainService';

const DomainProviderPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [error, setError] = useState('');
  const [tlds, setTlds] = useState(['.com', '.net', '.org', '.io', '.co', '.store', '.shop', '.online', '.tech']);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    setTimeout(() => {
      if (searchResults.length === 0) {
        fetchDomainAvailability('timskitchen');
      }
    }, 500);
    
    // Show an initial notification explaining this is a view-only page
    setNotification({
      type: 'info',
      message: 'This is a view-only page from your domain registrar. To make changes or purchases, please log in to your domain provider account.'
    });
    
    // Clear notification after 8 seconds
    const timer = setTimeout(() => {
      setNotification(null);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show modal for unauthorized actions
  const showActionModal = (action) => {
    setModalMessage(`This is a view-only page. To ${action}, please log in to your domain provider's website. Contact your web administrator for access.`);
    setModalOpen(true);
  };

  // Simulate checking domain availability using our service
  const fetchDomainAvailability = async (domain) => {
    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const results = await checkDomainAvailability(domain, tlds);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching domains:', err);
      setError('An error occurred while checking domain availability. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    let query = searchQuery.trim().toLowerCase();
    fetchDomainAvailability(query);
  };

  const toggleDomainSelection = (domain) => {
    if (selectedDomains.some(d => d.domain === domain.domain)) {
      setSelectedDomains(selectedDomains.filter(d => d.domain !== domain.domain));
      // Show temporary success notification
      setNotification({
        type: 'success',
        message: `${domain.domain} removed from selection`
      });
    } else {
      setSelectedDomains([...selectedDomains, domain]);
      // Show temporary success notification
      setNotification({
        type: 'success',
        message: `${domain.domain} added to selection`
      });
    }
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const isDomainSelected = (domain) => {
    return selectedDomains.some(d => d.domain === domain);
  };

  const totalAmount = selectedDomains.reduce((total, domain) => total + parseFloat(domain.price), 0).toFixed(2);
  
  // Handle any action other than select
  const handleRestrictedAction = (action) => {
    showActionModal(action);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="bg-white p-1 rounded-full mr-2">
                <svg className="h-8 w-8 text-blue-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">DomainMaster Pro</h1>
                <p className="text-blue-100 text-xs md:text-sm">Professional Domain Registration Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => handleRestrictedAction('access support')} 
                className="text-blue-100 hover:text-white text-sm md:text-base hidden md:inline"
              >
                Support
              </button>
              <button 
                onClick={() => handleRestrictedAction('check prices')} 
                className="text-blue-100 hover:text-white text-sm md:text-base hidden md:inline"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleRestrictedAction('login to your account')} 
                className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition duration-150"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-0 mx-2 md:mx-4 my-2 md:my-4 max-w-sm z-50 animate-fade-in-down ${
          notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' :
          notification.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' :
          'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700'
        } p-3 md:p-4 rounded shadow-lg`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <FaCheckCircle className="h-4 w-4 md:h-5 md:w-5" />}
                {notification.type === 'info' && <FaInfoCircle className="h-4 w-4 md:h-5 md:w-5" />}
                {notification.type === 'warning' && <FaExclamationTriangle className="h-4 w-4 md:h-5 md:w-5" />}
              </div>
              <div className="ml-2 md:ml-3">
                <p className="text-xs md:text-sm">{notification.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="flex-shrink-0 ml-2 md:ml-4"
            >
              <FaTimes className="h-3 w-3 md:h-4 md:w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* View-only Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in-down">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-500 h-6 w-6 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">View-Only Access</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-600">{modalMessage}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Domain search */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-4 md:mb-6">Find Your Perfect Domain Name</h2>
            
            <form onSubmit={handleSearch} className="mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row">
                <div className="relative flex-grow mb-3 md:mb-0 md:mr-4">
                  <input
                    type="text"
                    placeholder="Enter your domain name..."
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center justify-center transition duration-150"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <><FaSpinner className="animate-spin mr-2" /> Searching...</>
                  ) : (
                    <><FaSearch className="mr-2" /> Search Domain</>
                  )}
                </button>
              </div>
            </form>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-blue-500 mt-1">
                  <FaInfoCircle className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs md:text-sm text-blue-700">
                    All domains include free SSL certificate, email forwarding, and privacy protection.
                    <span className="hidden md:inline"> Our domains are also fully compatible with popular website builders.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs md:text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">Search Results</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {searchResults.map((result, index) => (
                      <tr key={index} className={result.available ? "bg-white hover:bg-gray-50" : "bg-gray-50"}>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-900">
                          {result.domain}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          {result.available ? (
                            <span className="flex items-center text-green-600 text-xs md:text-sm">
                              <FaCheckCircle className="mr-1" /> Available
                            </span>
                          ) : (
                            <span className="flex items-center text-red-500 text-xs md:text-sm">
                              <FaTimesCircle className="mr-1" /> Taken
                            </span>
                          )}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-500">
                          {result.available ? (
                            <span className="font-medium text-gray-900">${result.price}/year</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium">
                          {result.available ? (
                            <button
                              onClick={() => toggleDomainSelection(result)}
                              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium ${
                                isDomainSelected(result.domain)
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {isDomainSelected(result.domain) ? "Selected" : "Select"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestrictedAction('check WHOIS information')}
                              className="px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              WHOIS
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs md:text-sm text-yellow-800">
                <div className="flex">
                  <FaInfoCircle className="flex-shrink-0 h-4 w-4 md:h-5 md:w-5 text-yellow-600 mt-0.5" />
                  <p className="ml-2">
                    <strong>Premium Domain Services:</strong> Our pricing includes domain privacy, advanced DNS management, and 24/7 support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected domains */}
          {selectedDomains.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">Selected Domains</h3>
              
              <div className="overflow-x-auto mb-4 md:mb-6">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Period</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedDomains.map((domain, index) => (
                      <tr key={index}>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-900">{domain.domain}</td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-500">
                          <button 
                            onClick={() => handleRestrictedAction('change registration period')} 
                            className="text-blue-700 underline hover:text-blue-800"
                          >
                            1 Year
                          </button>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-900">${domain.price}</td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium">
                          <button
                            onClick={() => toggleDomainSelection(domain)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="py-3 md:py-4 px-2 md:px-4 text-right font-medium text-xs md:text-sm">Total:</td>
                      <td colSpan="2" className="py-3 md:py-4 px-2 md:px-4 text-gray-900 font-bold text-xs md:text-sm">${totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-right">
                <button 
                  onClick={() => handleRestrictedAction('proceed to checkout')} 
                  className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition duration-150 flex items-center justify-center ml-auto"
                >
                  <FaShoppingCart className="mr-2" /> Proceed to Checkout
                </button>
              </div>
            </div>
          )}

          {/* Features section */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-center mb-4 md:mb-6">Why Choose DomainMaster Pro?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center p-3 md:p-4 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md transition-all">
                <div className="bg-blue-100 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h4 className="text-md md:text-lg font-medium mb-1 md:mb-2">Free SSL Certificate</h4>
                <p className="text-gray-600 text-xs md:text-sm">Secure your website with HTTPS encryption at no extra cost.</p>
              </div>
              
              <div className="text-center p-3 md:p-4 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md transition-all">
                <div className="bg-blue-100 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="text-md md:text-lg font-medium mb-1 md:mb-2">Email Forwarding</h4>
                <p className="text-gray-600 text-xs md:text-sm">Create professional email addresses for your domain.</p>
              </div>
              
              <div className="text-center p-3 md:p-4 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md transition-all">
                <div className="bg-blue-100 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="text-md md:text-lg font-medium mb-1 md:mb-2">Privacy Protection</h4>
                <p className="text-gray-600 text-xs md:text-sm">Keep your personal information hidden from public WHOIS databases.</p>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-gray-200">
              <h4 className="text-md md:text-lg font-medium mb-3 text-center">Trusted by Over 2 Million Customers</h4>
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-60">
                <img src="/company1.png" alt="DOMAIN" className="h-5 md:h-8" />
                <img src="/company2.png" alt="namecheap" className="h-5 md:h-8" />
                <img src="/company3.png" alt="bluehost" className="h-5 md:h-8" />
                <img src="/company4.png" alt="WordPress" className="h-5 md:h-8" />
              </div>
            </div>
          </div>
          
          {/* Domain pricing card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-center mb-4">Popular Domain Pricing</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-all">
                <p className="text-lg md:text-xl font-bold text-gray-800">.com</p>
                <p className="text-sm md:text-md mt-1 text-gray-900 font-medium">$111.99/yr</p>
                <p className="text-xs text-gray-500 mt-1">Most Popular</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-all">
                <p className="text-lg md:text-xl font-bold text-gray-800">.net</p>
                <p className="text-sm md:text-md mt-1 text-gray-900 font-medium">$82.99/yr</p>
                <p className="text-xs text-gray-500 mt-1">Networks</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-all">
                <p className="text-lg md:text-xl font-bold text-gray-800">.org</p>
                <p className="text-sm md:text-md mt-1 text-gray-900 font-medium">$60.99/yr</p>
                <p className="text-xs text-gray-500 mt-1">Organizations</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-all">
                <p className="text-lg md:text-xl font-bold text-gray-800">.io</p>
                <p className="text-sm md:text-md mt-1 text-gray-900 font-medium">$99.99/yr</p>
                <p className="text-xs text-gray-500 mt-1">Tech Startups</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => handleRestrictedAction('view all domain pricing')}
                className="text-blue-700 hover:text-blue-800 text-sm font-medium underline"
              >
                View All TLD Pricing
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">DomainMaster Pro</h3>
              <p className="text-gray-400 mb-4 text-xs md:text-sm">Premium domain registration services for businesses and individuals.</p>
              <div className="flex space-x-3 md:space-x-4">
                <button onClick={() => handleRestrictedAction('visit social media')} className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
                <button onClick={() => handleRestrictedAction('visit social media')} className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button onClick={() => handleRestrictedAction('visit social media')} className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
              <ul className="space-y-2 text-xs md:text-sm">
                <li><button onClick={() => handleRestrictedAction('visit domain search')} className="text-gray-400 hover:text-white">Domain Search</button></li>
                <li><button onClick={() => handleRestrictedAction('visit web hosting page')} className="text-gray-400 hover:text-white">Web Hosting</button></li>
                <li><button onClick={() => handleRestrictedAction('visit ssl certificates page')} className="text-gray-400 hover:text-white">SSL Certificates</button></li>
                <li><button onClick={() => handleRestrictedAction('visit domain transfer page')} className="text-gray-400 hover:text-white">Domain Transfer</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@domainmasterpro.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 md:h-6 md:w-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (800) 555-1234</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-4 md:pt-6 text-center text-gray-500 text-xs md:text-sm">
            <p>© 2025 DomainMaster Pro. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <button onClick={() => handleRestrictedAction('view privacy policy')} className="hover:text-gray-300">Privacy Policy</button>
              <button onClick={() => handleRestrictedAction('view terms of service')} className="hover:text-gray-300">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DomainProviderPage;