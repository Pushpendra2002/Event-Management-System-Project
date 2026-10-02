/**
 * Utility functions for consistent formatting across the application
 */

/**
 * Formats a numeric amount to Indian Rupee (INR - ₹)
 * e.g., 500 -> ₹500, 125000 -> ₹1,25,000, 499.5 -> ₹499.50
 *
 * @param {number|string} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2
  }).format(numericAmount);
};

const formatters = {
  formatCurrency
};

export default formatters;
