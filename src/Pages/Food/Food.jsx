import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoods, setCurrentPage } from '../../redux/slices/foodSlice';
import { Helmet } from 'react-helmet';
import AllFoodCard from './AllFoodCard';
import { FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import LoadingSpinner from '../../Components/LoadingSpinner';
import Fuse from 'fuse.js';

const Food = () => {
    const dispatch = useDispatch();
    const { foods, loading, error, currentPage } = useSelector(state => state.food);
    console.log('Foods:', foods);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [foodPerPage, setFoodPerPage] = useState(6);
    const [fuse, setFuse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [displayCount, setDisplayCount] = useState(foodPerPage);
    const observer = useRef();
    
    useEffect(() => {
        if (foods.length > 0) {
            const fuseOptions = {
                includeScore: true,
                threshold: 0.4,
                keys: [
                    { name: 'foodName', weight: 0.7 },
                    { name: 'foodCategory', weight: 0.3 },
                    { name: 'foodDescription', weight: 0.2 }
                ]
            };
            setFuse(new Fuse(foods, fuseOptions));
            
            const uniqueCategories = [...new Set(foods.map(item => item.foodCategory))].filter(Boolean);
            setCategories(uniqueCategories);
        }
    }, [foods]);

    useEffect(() => {
        dispatch(fetchFoods({ page: currentPage, size: foodPerPage }));
        console.log('Fetching foods with page:', currentPage, 'and size:', foodPerPage);
    }, [dispatch, currentPage, foodPerPage]);

    useEffect(() => {
        setFilter(foods);
    }, [foods]);
    
    
    useEffect(() => {
        if (filter.length > 0) {
            setDisplayedItems(filter.slice(0, displayCount));
            setHasMore(displayCount < filter.length);
        }
    }, [filter, displayCount]);

    const lastFoodElementRef = useCallback(node => {
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
        
        if (displayCount + foodPerPage > foods.length && hasMore) {
            dispatch(setCurrentPage(currentPage + 1));
            
            setTimeout(() => {
                setDisplayCount(prev => prev + foodPerPage);
                setIsLoading(false);
            }, 800);
        } else {
            setTimeout(() => {
                setDisplayCount(prev => prev + foodPerPage);
                setIsLoading(false);
            }, 500);
        }
    };

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
                    setFilter(foods.filter(item => item.foodCategory === selectedCategory));
                } else {
                    setFilter(foods);
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
                item => item.foodCategory === selectedCategory
            );
        }
        
        setFilter(filteredResults);
    }, 300);
    
    const handleSearch = () => {
        if (!search) {
            if (selectedCategory) {
                setFilter(foods.filter(item => item.foodCategory === selectedCategory));
            } else {
                setFilter(foods);
            }
            return;
        }
        
        if (!fuse) return;
        
        const results = fuse.search(search);
        let filteredResults = results.map(result => result.item);
        
        if (selectedCategory) {
            filteredResults = filteredResults.filter(
                item => item.foodCategory === selectedCategory
            );
        }
        
        setFilter(filteredResults);
        setShowSuggestions(false);
        setDisplayCount(foodPerPage);
    };
    
    const handleSuggestionClick = (suggestion) => {
        setSearch(suggestion.foodName);
        setShowSuggestions(false);
        
        let filteredResults = [suggestion];
        
        if (selectedCategory && suggestion.foodCategory !== selectedCategory) {
            setSelectedCategory('');
        }
        
        setFilter(filteredResults);
        setDisplayCount(foodPerPage);
    };
    
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        
        if (!category) {
            if (search && fuse) {
                const results = fuse.search(search);
                setFilter(results.map(result => result.item));
            } else {
                setFilter(foods);
            }
            return;
        }
        
        if (search && fuse) {
            const results = fuse.search(search);
            const filteredResults = results
                .map(result => result.item)
                .filter(item => item.foodCategory === category);
            setFilter(filteredResults);
        } else {
            setFilter(foods.filter(item => item.foodCategory === category));
        }
        
        setDisplayCount(foodPerPage);
    };
    
    const clearSearch = () => {
        setSearch('');
        setSuggestions([]);
        setShowSuggestions(false);
        
        if (selectedCategory) {
            setFilter(foods.filter(item => item.foodCategory === selectedCategory));
        } else {
            setFilter(foods);
        }
        
        setDisplayCount(foodPerPage);
    };

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | All-Food</title>
            </Helmet>
            <div className='bg-[#121212] w-full h-screen relative'>
                <img 
                    className='w-full brightness-75 mx-auto h-[60%] my-auto bg-center bg-cover object-cover' 
                    src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/gallery-i-6.jpg" 
                    alt="" 
                />
                <div className="absolute inset-0"></div>
                <div className='absolute w-full top-0 left-0 h-full'>
                    <div className='inset-0 absolute -top-52 flex flex-col gap-10 justify-center items-center text-black w-full p-5'>
                        <div className="flex gap-4 lg:flex-col flex-col items-center"></div>
                        <h2 className='text-3xl lg:text-5xl text-white font-bold'>Search Your Food</h2>
                        
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
                                            placeholder='Search food name or category...'
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
                                                        src={item.foodImage} 
                                                        alt={item.foodName} 
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className='font-medium'>{item.foodName}</p>
                                                        <p className='text-xs text-gray-500'>{item.foodCategory}</p>
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
                {loading && displayCount <= foodPerPage ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-red-500 text-center py-10">
                        Error: {error}
                    </div>
                ) : filter.length === 0 ? (
                    <div className="text-white text-center py-10">
                        No foods found. Try a different search.
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                            {displayedItems.map((data, index) => {
                                if (displayedItems.length === index + 1) {
                                    return (
                                        <div ref={lastFoodElementRef} key={data._id}>
                                            <AllFoodCard data={data} />
                                        </div>
                                    );
                                } else {
                                    return <AllFoodCard key={data._id} data={data} />;
                                }
                            })}
                        </div>
                        
                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-center items-center py-8">
                                <FaSpinner className="animate-spin text-yellow-600 text-2xl" />
                                <span className="ml-2 text-gray-300">Loading more foods...</span>
                            </div>
                        )}
                        
                        {/* Load more button and controls */}
                        <div className="flex flex-col items-center justify-center mt-10 space-y-4">
                            {/* Debug output to help understand why button might not be showing */}
                            <div className="text-xs text-gray-500">
                                isLoading: {isLoading ? 'true' : 'false'}, 
                                hasMore: {hasMore ? 'true' : 'false'}, 
                                filter length: {filter.length}, 
                                displayCount: {displayCount}
                            </div>
                            
                            {/* Make Load More button more visible with better conditionals */}
                            {!isLoading && hasMore && filter.length > 0 && (
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors shadow-lg font-medium"
                                >
                                    Load More Items
                                </button>
                            )}
                            
                            {/* Items per page selector */}
                            <div className="flex items-center justify-center text-sm mt-4">
                                <label htmlFor="itemsPerPage" className="text-gray-400 mr-2">Items per batch:</label>
                                <select
                                    id="itemsPerPage"
                                    className="bg-gray-800 border border-gray-700 text-white rounded-md px-2 py-1 text-sm"
                                    value={foodPerPage}
                                    onChange={(e) => {
                                        const newSize = parseInt(e.target.value);
                                        setFoodPerPage(newSize);
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
                            
                            {!hasMore && filter.length > foodPerPage && (
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

export default Food;