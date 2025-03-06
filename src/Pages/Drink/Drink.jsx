import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrinks, setCurrentPage } from '../../redux/slices/drinkSlice';
import { Helmet } from 'react-helmet';
import AllDrinkCard from './AllDrinkCard';
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { FaSearch, FaTimes } from "react-icons/fa";
import LoadingSpinner from '../../Components/LoadingSpinner';
import Fuse from 'fuse.js';

const Drink = () => {
    const dispatch = useDispatch();
    const { drinks, loading, error, currentPage } = useSelector(state => state.drink);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [drinkPerPage, setDrinkPerPage] = useState(9);
    const [fuse, setFuse] = useState(null);
    
    useEffect(() => {
        if (drinks.length > 0) {
            const fuseOptions = {
                includeScore: true,
                threshold: 0.4,
                keys: [
                    { name: 'drinkName', weight: 0.7 },
                    { name: 'drinkCategory', weight: 0.3 },
                    { name: 'drinkDescription', weight: 0.2 }
                ]
            };
            setFuse(new Fuse(drinks, fuseOptions));
            
            const uniqueCategories = [...new Set(drinks.map(item => item.drinksCategory))].filter(Boolean);
            setCategories(uniqueCategories);
        }
    }, [drinks]);

    useEffect(() => {
        dispatch(fetchDrinks({ page: currentPage, size: drinkPerPage }));
    }, [dispatch, currentPage, drinkPerPage]);

    useEffect(() => {
        setFilter(drinks);
    }, [drinks]);
    
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };
    
    // Handle search input change with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        if (value.length > 1) {
            debouncedSearch(value);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            
            if (!value) {
                if (selectedCategory) {
                    setFilter(drinks.filter(item => item.drinkCategory === selectedCategory));
                } else {
                    setFilter(drinks);
                }
            }
        }
    };
    
    // Debounced search function
    const debouncedSearch = debounce((value) => {
        if (!fuse || !value) return;
        
        const results = fuse.search(value);
        
        const suggestionResults = results
            .map(result => result.item)
            .slice(0, 5);
            
        setSuggestions(suggestionResults);
        
        let filteredResults = results.map(result => result.item);
        
        if (selectedCategory) {
            filteredResults = filteredResults.filter(
                item => item.drinkCategory === selectedCategory
            );
        }
        
        setFilter(filteredResults);
    }, 300);
    
    const handleSearch = () => {
        if (!search) {
            if (selectedCategory) {
                setFilter(drinks.filter(item => item.drinkCategory === selectedCategory));
            } else {
                setFilter(drinks);
            }
            return;
        }
        
        if (!fuse) return;
        
        const results = fuse.search(search);
        let filteredResults = results.map(result => result.item);
        
        if (selectedCategory) {
            filteredResults = filteredResults.filter(
                item => item.drinkCategory === selectedCategory
            );
        }
        
        setFilter(filteredResults);
        setShowSuggestions(false);
    };
    
    const handleSuggestionClick = (suggestion) => {
        setSearch(suggestion.drinkName);
        setShowSuggestions(false);
        
        let filteredResults = [suggestion];
        
        if (selectedCategory && suggestion.drinkCategory !== selectedCategory) {
            setSelectedCategory('');
        }
        
        setFilter(filteredResults);
    };
    
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        
        if (!category) {
            if (search && fuse) {
                const results = fuse.search(search);
                setFilter(results.map(result => result.item));
            } else {
                setFilter(drinks);
            }
            return;
        }
        
        if (search && fuse) {
            const results = fuse.search(search);
            const filteredResults = results
                .map(result => result.item)
                .filter(item => item.drinksCategory === category);
            setFilter(filteredResults);
        } else {
            setFilter(drinks.filter(item => item.drinksCategory === category));
        }
    };
    
    const clearSearch = () => {
        setSearch('');
        setSuggestions([]);
        setShowSuggestions(false);
        
        if (selectedCategory) {
            setFilter(drinks.filter(item => item.drinkCategory === selectedCategory));
        } else {
            setFilter(drinks);
        }
    };
    
    const handlePrev = () => {
        if (currentPage > 0) {
            dispatch(setCurrentPage(currentPage - 1));
        }
    };

    const handleNext = () => {
        if (filter.length === drinkPerPage) {
            dispatch(setCurrentPage(currentPage + 1));
            return;
        }
        const maxPage = Math.ceil(filter.length / drinkPerPage) - 1;
        if (currentPage < maxPage) {
            dispatch(setCurrentPage(currentPage + 1));
        }
    };

    const handleFirst = () => {
        dispatch(setCurrentPage(0));
    };

    const handleLast = () => {
        const lastPage = Math.ceil(filter.length / drinkPerPage) - 1;
        dispatch(setCurrentPage(lastPage));
    };

    const renderPaginationItems = () => {
        const totalPages = Math.ceil(filter.length / drinkPerPage);
        if (totalPages <= 1) return null;
        
        const items = [];
        
        items.push(
            <button 
                onClick={() => dispatch(setCurrentPage(0))} 
                key="first-page" 
                className={`mx-1 px-3 py-1 rounded-md border ${currentPage === 0 ? "bg-yellow-800 text-white border-yellow-600" : "bg-[#121212] text-white border-gray-700 hover:bg-gray-800"}`}
                aria-label="Page 1"
                aria-current={currentPage === 0 ? "page" : undefined}
            >
                1
            </button>
        );
        
        if (totalPages > 7) {
            if (currentPage > 3) {
                items.push(<span key="ellipsis-1" className="mx-1 text-white">...</span>);
            }
            
            const startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages - 2, currentPage + 1);
            
            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <button 
                        onClick={() => dispatch(setCurrentPage(i))} 
                        key={i} 
                        className={`mx-1 px-3 py-1 rounded-md border ${currentPage === i ? "bg-yellow-800 text-white border-yellow-600" : "bg-[#121212] text-white border-gray-700 hover:bg-gray-800"}`}
                        aria-label={`Page ${i + 1}`}
                        aria-current={currentPage === i ? "page" : undefined}
                    >
                        {i + 1}
                    </button>
                );
            }
            
            if (currentPage < totalPages - 4) {
                items.push(<span key="ellipsis-2" className="mx-1 text-white">...</span>);
            }
            
            if (totalPages > 1) {
                items.push(
                    <button 
                        onClick={() => dispatch(setCurrentPage(totalPages - 1))} 
                        key="last-page" 
                        className={`mx-1 px-3 py-1 rounded-md border ${currentPage === totalPages - 1 ? "bg-yellow-800 text-white border-yellow-600" : "bg-[#121212] text-white border-gray-700 hover:bg-gray-800"}`}
                        aria-label={`Page ${totalPages}`}
                        aria-current={currentPage === totalPages - 1 ? "page" : undefined}
                    >
                        {totalPages}
                    </button>
                );
            }
        } else {
            for (let i = 1; i < totalPages; i++) {
                items.push(
                    <button 
                        onClick={() => dispatch(setCurrentPage(i))} 
                        key={i} 
                        className={`mx-1 px-3 py-1 rounded-md border ${currentPage === i ? "bg-yellow-800 text-white border-yellow-600" : "bg-[#121212] text-white border-gray-700 hover:bg-gray-800"}`}
                        aria-label={`Page ${i + 1}`}
                        aria-current={currentPage === i ? "page" : undefined}
                    >
                        {i + 1}
                    </button>
                );
            }
        }
        
        return items;
    };

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | All-Drink</title>
            </Helmet>
            <div className='bg-[#121212] w-full h-screen relative'>
                <img 
                    className='w-full brightness-75 mx-auto h-[60%] my-auto bg-center bg-cover object-cover' 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmjJSg35uns6TQqok1SUlJW9WVa47jFmD33w&s" 
                    alt="" 
                />
                <div className="absolute inset-0"></div>
                <div className='absolute w-full top-0 left-0 h-full'>
                    <div className='inset-0 absolute -top-52 flex flex-col gap-10 justify-center items-center text-black w-full p-5'>
                        <div className="flex gap-4 lg:flex-col flex-col items-center"></div>
                        <h2 className='text-3xl lg:text-5xl text-white font-bold'>Search Your Drink</h2>
                        
                        <div className='max-w-[700px] mx-auto w-full'>
                            <div className='flex flex-col items-center'>
                                <div className='flex w-full relative'>
                                    <div className='lg:w-[350px] w-full relative'>
                                        <input 
                                            onChange={handleSearchChange}
                                            value={search}
                                            className='border-2 py-3 w-full border-white text-gray-700 rounded-tl-lg rounded-bl-lg px-4 pr-10'
                                            type="text"
                                            name="text"
                                            id=""
                                            placeholder='Search drink name or category...'
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch();
                                                }
                                            }}
                                        />
                                        {search && (
                                            <button 
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                    <div className='relative right-0'>
                                        <button
                                            onClick={handleSearch}
                                            className='rounded-tr-lg tracking-wider font-se rounded-br-lg font-semibold bg-yellow-700 px-5 py-3.5 text-gray-900'
                                        >
                                            <FaSearch />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Search suggestions dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className='absolute z-10 w-full max-w-[700px] bg-white mt-14 rounded-lg shadow-lg overflow-hidden'>
                                        <ul className='divide-y divide-gray-100'>
                                            {suggestions.map((item, index) => (
                                                <li 
                                                    key={index}
                                                    className='px-4 py-2 hover:bg-yellow-50 cursor-pointer flex items-center gap-3'
                                                    onClick={() => handleSuggestionClick(item)}
                                                >
                                                    <img 
                                                        src={item.drinkImage} 
                                                        alt={item.drinkName} 
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className='font-medium'>{item.drinkName}</p>
                                                        <p className='text-xs text-gray-500'>{item.drinkCategory}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Category filter */}
                                <div className="relative left-0">
                                    <select 
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        className="w-full rounded-lg border-2 border-white py-3 px-4 text-gray-700"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='bg-[#121212] -mt-40 pb-20 lg:px-28 px-6'>
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-red-500 text-center py-10">
                        Error: {error}
                    </div>
                ) : filter.length === 0 ? (
                    <div className="text-white text-center py-10">
                        No Drink found. Try a different search.
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                        {filter.map(data => <AllDrinkCard key={data._id} data={data} />)}
                    </div>
                )}
            </div>

            {/* Enhanced modern pagination */}
            <div className='bg-[#121212] flex flex-col items-center pb-20 text-center text-white'>
                <div className="flex flex-wrap justify-center items-center mb-4">
                    {filter.length > 0 && (
                        <p className="text-sm text-gray-400 mb-4 w-full">
                            Showing {Math.min(currentPage * drinkPerPage + 1, filter.length)} to {Math.min((currentPage + 1) * drinkPerPage, filter.length)} of {filter.length} items
                        </p>
                    )}
                    
                    <div className="flex items-center">
                        {/* First page button */}
                        <button 
                            className={`px-2 mx-1 rounded-md border py-1 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'} bg-[#121212] text-white hidden sm:block`}
                            onClick={handleFirst}
                            disabled={currentPage === 0}
                            aria-label="First page"
                        >
                            <span className="sr-only">First</span>
                            <span aria-hidden="true">««</span>
                        </button>
                        
                        {/* Previous page button */}
                        <button 
                            className={`px-3 mx-1 rounded-md border py-1 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'} bg-[#121212] text-white`}
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                            aria-label="Previous page"
                        >
                            <AiOutlineLeft aria-hidden="true" />
                            <span className="sr-only">Previous</span>
                        </button>
                        
                        {/* Page numbers */}
                        <div className="hidden sm:flex mx-1">
                            {renderPaginationItems()}
                        </div>
                        
                        {/* Current page indicator for mobile */}
                        <div className="sm:hidden mx-2 py-1 px-3 bg-yellow-800 rounded-md">
                            <span>{currentPage + 1}</span>
                            <span className="text-gray-400 text-xs ml-1">/ {Math.ceil(filter.length / drinkPerPage)}</span>
                        </div>
                        
                        {/* Next page button */}
                        <button 
                            className={`px-3 mx-1 rounded-md border py-1 ${currentPage >= Math.ceil(filter.length / drinkPerPage) - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'} bg-[#121212] text-white`}
                            onClick={handleNext}
                            disabled={currentPage >= Math.ceil(filter.length / drinkPerPage) - 1}
                            aria-label="Next page"
                        >
                            <AiOutlineRight aria-hidden="true" />
                            <span className="sr-only">Next</span>
                        </button>
                        
                        {/* Last page button */}
                        <button 
                            className={`px-2 mx-1 rounded-md border py-1 ${currentPage >= Math.ceil(filter.length / drinkPerPage) - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'} bg-[#121212] text-white hidden sm:block`}
                            onClick={handleLast}
                            disabled={currentPage >= Math.ceil(filter.length / drinkPerPage) - 1}
                            aria-label="Last page"
                        >
                            <span className="sr-only">Last</span>
                            <span aria-hidden="true">»»</span>
                        </button>
                    </div>
                </div>
                
                {/* Items per page selector */}
                <div className="flex items-center justify-center text-sm mt-2">
                    <label htmlFor="pageSize" className="text-gray-400 mr-2">Items per page:</label>
                    <select
                        id="pageSize"
                        className="bg-gray-800 border border-gray-700 text-white rounded-md px-2 py-1 text-sm"
                        value={drinkPerPage}
                        onChange={(e) => {
                            const newSize = parseInt(e.target.value);
                            setDrinkPerPage(newSize);
                            dispatch(setCurrentPage(0));
                        }}
                        aria-label="Number of items per page"
                    >
                        <option value="6">6</option>
                        <option value="9">9</option>
                        <option value="12">12</option>
                        <option value="24">24</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default Drink;