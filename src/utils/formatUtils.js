/**
 * Format a number as currency with commas
 * @param {number|string} value
 * @param {boolean} showSymbol
 * @returns {string}
 */
export const formatPrice = (value, showSymbol = true) => {
  if (!value && value !== 0) return showSymbol ? '₦0.00' : '0.00';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return showSymbol ? '₦0.00' : '0.00';
  
  const formatted = numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return showSymbol ? `₦${formatted}` : formatted;
};

/**
 * Capitalize the first letter of each word
 * @param {string} text
 * @returns {string}
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
