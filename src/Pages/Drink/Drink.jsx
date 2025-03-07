import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrinks, setCurrentPage } from '../../redux/slices/drinkSlice';
import { Helmet } from 'react-helmet';
import AllDrinkCard from './AllDrinkCard';
import { FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
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
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [displayCount, setDisplayCount] = useState(drinkPerPage);
    const observer = useRef();
    const loadingRef = useRef(null);
    
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
    
    useEffect(() => {
        setDisplayedItems(filter.slice(0, displayCount));
        setHasMore(displayCount < filter.length);
    }, [filter, displayCount]);

    const lastDrinkElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreItems();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const loadMoreItems = () => {
        if (isLoading || !hasMore) return;
        
        setIsLoading(true);
        
        if (displayCount + drinkPerPage > drinks.length && hasMore) {
            dispatch(setCurrentPage(currentPage + 1))
                .then(() => {
                    setDisplayCount(prev => prev + drinkPerPage);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        } else {
            setTimeout(() => {
                setDisplayCount(prev => prev + drinkPerPage);
                setIsLoading(false);
            }, 500);
        }
    };

    // Handle manual "Load More" button click
    const handleLoadMore = () => {
        if (!isLoading) {
            loadMoreItems();
        }
    };
    
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
        setDisplayCount(drinkPerPage);
    };
    
    const handleSuggestionClick = (suggestion) => {
        setSearch(suggestion.drinkName);
        setShowSuggestions(false);
        
        let filteredResults = [suggestion];
        
        if (selectedCategory && suggestion.drinkCategory !== selectedCategory) {
            setSelectedCategory('');
        }
        
        setFilter(filteredResults);
        setDisplayCount(drinkPerPage);
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
        
        setDisplayCount(drinkPerPage);
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
        
        setDisplayCount(drinkPerPage);
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
                {loading && displayCount <= drinkPerPage ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-red-500 text-center py-10">
                        Error: {error}
                    </div>
                ) : filter.length === 0 ? (
                    <div className="text-white text-center py-10">
                        No drinks found. Try a different search.
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                            {displayedItems.map((data, index) => {
                                if (displayedItems.length === index + 1) {
                                    // Last item - attach ref for intersection observer
                                    return (
                                        <div ref={lastDrinkElementRef} key={data._id}>
                                            <AllDrinkCard data={data} />
                                        </div>
                                    );
                                } else {
                                    return <AllDrinkCard key={data._id} data={data} />;
                                }
                            })}
                        </div>
                        
                        {isLoading && (
                            <div className="flex justify-center items-center py-8">
                                <FaSpinner className="animate-spin text-yellow-600 text-2xl" />
                                <span className="ml-2 text-gray-300">Loading more drinks...</span>
                            </div>
                        )}
                        
                        {/* Load more buttons */}
                        <div className="flex flex-col items-center justify-center mt-10 space-y-4">
                            {!isLoading && hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg transition-colors shadow-lg"
                                >
                                    Load More
                                </button>
                            )}
                            
                            {/* Items per page selector */}
                            <div className="flex items-center justify-center text-sm mt-4">
                                <label htmlFor="itemsPerPage" className="text-gray-400 mr-2">Items per batch:</label>
                                <select
                                    id="itemsPerPage"
                                    className="bg-gray-800 border border-gray-700 text-white rounded-md px-2 py-1 text-sm"
                                    value={drinkPerPage}
                                    onChange={(e) => {
                                        const newSize = parseInt(e.target.value);
                                        setDrinkPerPage(newSize);
                                        setDisplayCount(newSize);
                                        dispatch(setCurrentPage(0));
                                    }}
                                    aria-label="Number of items per load"
                                >
                                    <option value="6">6</option>
                                    <option value="9">9</option>
                                    <option value="12">12</option>
                                    <option value="24">24</option>
                                </select>
                            </div>
                            
                            {!hasMore && filter.length > drinkPerPage && (
                                <div className="text-center mt-4 text-gray-400">
                                    You've reached the end of the list.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Drink;