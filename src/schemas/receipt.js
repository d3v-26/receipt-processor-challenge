const { validateItem } = require('./item');

/**
 * @typedef {Object} Receipt
 * @property {string} retailer - The name of the retailer (pattern: ^[\w\s\-&]+$)
 * @property {string} purchaseDate - The date of purchase (YYYY-MM-DD)
 * @property {string} purchaseTime - The time of purchase (HH:mm)
 * @property {Item[]} items - Array of items purchased (min length: 1)
 * @property {string} total - The total amount paid (pattern: ^\d+\.\d{2}$)
 */

/**
 * Validates a receipt object against the schema
 * @param {Receipt} receipt - The receipt to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateReceipt = (receipt) => {
    const retailerRegex = /^[\w\s\-&]+$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const totalRegex = /^\d+\.\d{2}$/;

    // Check if receipt exists and has required properties
    if (!receipt || !receipt.items || !Array.isArray(receipt.items) || receipt.items.length < 1) {
        return false;
    }

    // Validate each field
    const isValid = (
        typeof receipt.retailer === 'string' &&
        typeof receipt.purchaseDate === 'string' &&
        typeof receipt.purchaseTime === 'string' &&
        typeof receipt.total === 'string' &&
        retailerRegex.test(receipt.retailer) &&
        dateRegex.test(receipt.purchaseDate) &&
        timeRegex.test(receipt.purchaseTime) &&
        totalRegex.test(receipt.total) &&
        receipt.items.every(item => validateItem(item))
    );

    // Additional date validation
    if (isValid) {
        const date = new Date(receipt.purchaseDate);
        if (isNaN(date.getTime())) return false;
    }

    return isValid;
};

module.exports = { validateReceipt };
