/**
 * Utility for handling money conversions between Cents (Database) and Dollars (UI).
 * Prevents floating point precision errors.
 */

export const toCents = (amount) => {
    if (amount === null || amount === undefined || amount === '') return 0;
    
    // Convert to string and handle commas (common in some locales)
    let sanitized = amount.toString().replace(',', '.');
    
    // Remove any non-numeric characters except the decimal point
    sanitized = sanitized.replace(/[^0-9.-]/g, '');
    
    const parsed = parseFloat(sanitized);
    if (isNaN(parsed)) return 0;
    
    // Rounding handles cases like 19.99 * 100 = 1998.9999999999998
    return Math.round(parsed * 100);
};

export const toDollars = (cents) => {
    if (cents === null || cents === undefined || isNaN(cents)) return 0;
    return parseFloat(cents) / 100;
};

export const formatMoney = (amount, currencySymbol = '$') => {
    return `${currencySymbol}${toDollars(amount).toFixed(2)}`;
};
