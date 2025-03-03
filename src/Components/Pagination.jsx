import React from 'react';
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  maxPagesToShow = 5 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) {
    return null;
  }

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-center mt-6 mb-4">
      {/* First page button */}
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-8 h-8 mx-1 rounded-md bg-gray-100 
                  hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleDoubleLeft size={14} />
      </button>
      
      {/* Previous page button */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-8 h-8 mx-1 rounded-md bg-gray-100 
                  hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleLeft size={14} />
      </button>

      {/* Show ellipsis if there are pages before the start */}
      {startPage > 1 && (
        <span className="flex items-center justify-center w-8 h-8 mx-1">...</span>
      )}

      {/* Page number buttons */}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => goToPage(number)}
          className={`flex items-center justify-center w-8 h-8 mx-1 rounded-md
            ${number === currentPage
              ? 'bg-yellow-600 text-white font-medium'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          disabled={number === currentPage}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <span className="flex items-center justify-center w-8 h-8 mx-1">...</span>
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-8 h-8 mx-1 rounded-md bg-gray-100 
                  hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleRight size={14} />
      </button>
      
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-8 h-8 mx-1 rounded-md bg-gray-100 
                  hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaAngleDoubleRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;
