import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrinks } from "../../redux/slices/drinkSlice";
import { Helmet } from "react-helmet";
import AllDrinkCard from "./AllDrinkCard";
import { FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import LoadingSpinner from "../../Components/LoadingSpinner";
import Fuse from "fuse.js";

const Drink = () => {
  const dispatch = useDispatch();
  const { drinks, loading, error } = useSelector((state) => state.drink);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [drinkPerPage] = useState(6);
  const [fuse, setFuse] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [displayCount, setDisplayCount] = useState(drinkPerPage);

  const observer = useRef();

  useEffect(() => {
    if (drinks.length > 0) {
      const fuseOptions = {
        includeScore: true,
        threshold: 0.4,
        keys: [
          { name: "drinkName", weight: 0.7 },
          { name: "drinkCategory", weight: 0.3 },
          { name: "drinkDescription", weight: 0.2 },
        ],
      };
      setFuse(new Fuse(drinks, fuseOptions));

      const uniqueCategories = [
        ...new Set(drinks.map((item) => item.drinkCategory)),
      ].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [drinks]);

  useEffect(() => {
    dispatch(fetchDrinks({ page: 0, size: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    setFilter(drinks);
  }, [drinks]);

  useEffect(() => {
    if (filter.length > 0) {
      setDisplayedItems(filter.slice(0, displayCount));
    }
  }, [filter, displayCount]);

  const lastDrinkElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && displayCount < filter.length) {
          loadMoreItems();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, displayCount, filter.length],
  );

  // Load more items function
  const loadMoreItems = () => {
    if (isLoading) return;

    setIsLoading(true);

    // Simply display more items from the already loaded list
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + drinkPerPage, filter.length));
      setIsLoading(false);
    }, 500);
  };

  // Handle Load More button click
  const handleLoadMore = () => {
    if (!isLoading) {
      loadMoreItems();
    }
  };

  // Apply filters to the all loaded drinks
  const applyFilters = () => {
    let filteredResults = allLoadedDrinks;

    if (search && fuse) {
      const results = fuse.search(search);
      filteredResults = results.map((result) => result.item);
    }

    if (selectedCategory) {
      filteredResults = filteredResults.filter(
        (item) => item.drinkCategory === selectedCategory,
      );
    }

    setFilter(filteredResults);
    setDisplayCount(Math.min(drinkPerPage, filteredResults.length));
  };

  // Debounce function for search input
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
          setFilter(
            allLoadedDrinks.filter(
              (item) => item.drinkCategory === selectedCategory,
            ),
          );
        } else {
          setFilter(allLoadedDrinks);
        }
        setDisplayCount(drinkPerPage);
      }
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    if (!fuse || !value) return;

    const results = fuse.search(value);

    const suggestionResults = results.map((result) => result.item).slice(0, 5);
    setSuggestions(suggestionResults);

    let filteredResults = results.map((result) => result.item);
    if (selectedCategory) {
      filteredResults = filteredResults.filter(
        (item) => item.drinkCategory === selectedCategory,
      );
    }

    setFilter(filteredResults);
    setDisplayCount(Math.min(drinkPerPage, filteredResults.length));
  }, 300);

  const handleSearch = () => {
    applyFilters();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.drinkName);
    setShowSuggestions(false);

    let filteredResults = [suggestion];

    if (selectedCategory && suggestion.drinkCategory !== selectedCategory) {
      setSelectedCategory("");
    }

    setFilter(filteredResults);
    setDisplayCount(Math.min(drinkPerPage, filteredResults.length));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    // Apply category filter along with any active search
    let filteredResults = allLoadedDrinks;

    if (search && fuse) {
      const searchResults = fuse.search(search);
      filteredResults = searchResults.map((result) => result.item);
    }

    if (category) {
      filteredResults = filteredResults.filter(
        (item) => item.drinkCategory === category,
      );
    }

    setFilter(filteredResults);
    setDisplayCount(Math.min(drinkPerPage, filteredResults.length));
  };

  const clearSearch = () => {
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);

    if (selectedCategory) {
      setFilter(
        allLoadedDrinks.filter(
          (item) => item.drinkCategory === selectedCategory,
        ),
      );
    } else {
      setFilter(allLoadedDrinks);
    }

    setDisplayCount(drinkPerPage);
  };

  // Calculate if we have more items to show
  const hasMore = displayCount < filter.length;

  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | All-Drinks</title>
      </Helmet>
      <div className="bg-[#121212] w-full h-screen relative">
        <img
          className="w-full brightness-75 mx-auto h-[60%] my-auto bg-center bg-cover object-cover"
          src="https://tastyc.bslthemes.com/wp-content/uploads/2021/04/gallery-i-6.jpg"
          alt=""
        />
        <div className="absolute inset-0"></div>
        <div className="absolute w-full top-0 left-0 h-full">
          <div className="inset-0 absolute -top-52 flex flex-col gap-10 justify-center items-center text-black w-full p-5">
            <div className="flex gap-4 lg:flex-col flex-col items-center"></div>
            <h2 className="text-3xl lg:text-5xl text-white font-bold">
              Search Your Drink
            </h2>

            <div className="max-w-[700px] mx-auto w-full">
              <div className="flex flex-col items-center">
                <div className="flex w-full relative">
                  <div className="lg:w-[350px] w-full relative">
                    <input
                      onChange={handleSearchChange}
                      value={search}
                      className="border-2 py-3 w-full border-white text-gray-700 rounded-tl-lg rounded-bl-lg px-4 pr-10"
                      type="text"
                      name="text"
                      id=""
                      placeholder="Search drink name or category..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
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
                  <div className="relative right-0">
                    <button
                      onClick={handleSearch}
                      className="rounded-tr-lg tracking-wider font-se rounded-br-lg font-semibold bg-blue-700 px-5 py-3.5 text-gray-100"
                    >
                      <FaSearch />
                    </button>
                  </div>
                </div>

                {/* Search suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full max-w-[700px] bg-white mt-14 rounded-lg shadow-lg overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                      {suggestions.map((item, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <img
                            src={item.drinkImage}
                            alt={item.drinkName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.drinkName}</p>
                            <p className="text-xs text-gray-500">
                              {item.drinkCategory}
                            </p>
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
                    {categories.map((category) => (
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

      <div className="bg-[#121212] -mt-40 pb-20 lg:px-28 px-6">
        {loading && displayedItems.length === 0 ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-500 text-center py-10">Error: {error}</div>
        ) : filter.length === 0 ? (
          <div className="text-white text-center py-10">
            No drinks found. Try a different search.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {displayedItems.map((data, index) => {
                if (displayedItems.length === index + 1) {
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

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                <span className="ml-2 text-gray-300">
                  Loading more drinks...
                </span>
              </div>
            )}

            {/* Load more controls */}
            <div className="flex flex-col items-center justify-center mt-10">
              {!isLoading && hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg font-medium"
                >
                  Load More Items
                </button>
              )}

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
