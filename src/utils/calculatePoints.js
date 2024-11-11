/**
 * Calculates points for a receipt based on the specified rules
 * @param {Object} receipt - The receipt object
 * @returns {number} - Total points earned
 */
function calculatePoints(receipt) {
    let points = 0;

    // 1. Points for retailer name (one point per alphanumeric character)
    points += (receipt.retailer.match(/[a-zA-Z0-9]/g) || []).length;

    // 2. 50 points if the total is a round dollar amount
    if (receipt.total.endsWith('.00')) {
        points += 50;
    }

    // 3. 25 points if the total is a multiple of 0.25
    const totalAsFloat = parseFloat(receipt.total);
    if (totalAsFloat % 0.25 === 0) {
        points += 25;
    }
    
    // 4. 5 points for every two items
    points += Math.floor(receipt.items.length / 2) * 5;

    // 5. Points for item descriptions that are multiples of 3
    receipt.items.forEach(item => {
        const trimmedLength = item.shortDescription.trim().length;
        if (trimmedLength % 3 === 0) {
            points += Math.ceil(parseFloat(item.price) * 0.2);
        }
    });

    // 6. 6 points if the day in the purchase date is odd
    const purchaseDay = parseInt(receipt.purchaseDate.split('-')[2]);
    if (purchaseDay % 2 === 1) {
        points += 6;
    }

    // 7. 10 points if time is between 2:00pm and 4:00pm
    const purchaseHour = parseInt(receipt.purchaseTime.split(':')[0]);
    const purchaseMinute = parseInt(receipt.purchaseTime.split(':')[1]);
    const timeInMinutes = purchaseHour * 60 + purchaseMinute;
    if (timeInMinutes >= 840 && timeInMinutes <= 960) { // 14:00 = 840 minutes, 16:00 = 960 minutes
        points += 10;
    }

    return points;
}

module.exports = { calculatePoints };
