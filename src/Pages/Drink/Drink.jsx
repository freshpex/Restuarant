import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrink, setCurrentPage } from '../../redux/slices/drinkSlice';
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
    const [drinkPerPage] = useState(9);
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
        dispatch(fetchDrink({ page: currentPage, size: drinkPerPage }));
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
        dispatch(setCurrentPage(currentPage + 1));
    };

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | All-Drink</title>
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

            <div className='bg-[#121212] flex justify-center items-center pb-20 text-center text-white'>
                <button className='px-3 mx-2 rounded-md border py-2 bg-[#121212] text-white' onClick={handlePrev}><AiOutlineLeft /></button>
                {[...Array(Math.ceil(drinks.length / drinkPerPage)).keys()].map(pages => (
                    <button 
                        onClick={() => dispatch(setCurrentPage(pages))} 
                        key={pages} 
                        className={`mx-2 px-3 rounded-md border py-1 bg-[#121212] text-white ${currentPage === pages && "bg-yellow-800 text-white"}`}
                    >
                        {pages + 1}
                    </button>
                ))}
                <button className='px-3 rounded-md border py-2 mx-2 bg-[#121212] text-white' onClick={handleNext}><AiOutlineRight /></button>
            </div>
        </>
    );
};

export default Drink;