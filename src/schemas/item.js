/**
 * @typedef {Object} Item
 * @property {string} shortDescription - The Short Product Description (pattern: ^[\w\s\-]+$)
 * @property {string} price - The total price paid (pattern: ^\d+\.\d{2}$)
 */

/**
 * Validates an item object against the schema
 * @param {Item} item - The item to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateItem = (item) => {
    const descriptionRegex = /^[\w\s\-]+$/;
    const priceRegex = /^\d+\.\d{2}$/;

    return (
        item &&
        typeof item.shortDescription === 'string' &&
        typeof item.price === 'string' &&
        descriptionRegex.test(item.shortDescription) &&
        priceRegex.test(item.price)
    );
};

module.exports = { validateItem };
