/**
 * Utility functions for the Analytics dashboard
 */

/**
 * Returns a default start date based on the period
 * @param {string} period - 'day', 'week', 'month', 'year'
 * @returns {string} date in YYYY-MM-DD format
 */
export const getDefaultStartDate = (period) => {
  const today = new Date();
  let result = new Date();
  
  switch(period) {
    case 'day':
      result = today;
      break;
    case 'week':
      result.setDate(today.getDate() - 7);
      break;
    case 'month':
      result.setMonth(today.getMonth() - 1);
      break;
    case 'year':
      result.setFullYear(today.getFullYear() - 1);
      break;
    default:
      result.setDate(today.getDate() - 7);
  }
  
  return result.toISOString().split('T')[0];
};

/**
 * Exports data to a CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename (without extension)
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    return;
  }
  
  const headers = Object.keys(data[0]).join(',');
  const csvRows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );
  
  const csvContent = [headers, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get filtered label based on date filter period
 * @param {string} period
 * @returns {string}
 */
export const getFilteredLabel = (period) => {
  switch(period) {
    case 'day':
      return "Today's";
    case 'week':
      return "This Week's";
    case 'month':
      return "This Month's";
    case 'year':
      return "This Year's";
    default:
      return "All Time";
  }
};
