const express = require('express'); // Express
const { v4: uuidv4 } = require('uuid'); // Generate unique IDs
const { calculatePoints } = require('../utils/calculatePoints'); // Calculate points
const { validateReceiptMiddleware } = require('../middleware/validateReceipt'); // Validate receipt

// Router
const router = express.Router();
// In-memory storage (replace with a database in production)
const receiptsStore = new Map();

/**
 * @route GET /
 * @description Welcome message
 */
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Receipt Processor web service!' });
});

/**
 * @route GET /health
 * @description Health check
 */
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

/**
 * @route POST /receipts/process
 * @description Process a receipt and return an ID
 */
router.post('/receipts/process', validateReceiptMiddleware, (req, res) => {
    try {
        // Generate a unique ID
        const id = uuidv4();
        
        // Store the receipt with its ID
        receiptsStore.set(id, {
            receipt: req.body,
            points: null // Points will be calculated when requested
        });

        // Return the ID as per API spec
        res.status(200).json({ id });
    } catch (error) {
        console.error('Error processing receipt:', error);
        res.status(400).json({ error: 'Failed to process receipt' });
    }
});

/**
 * @route GET /receipts/{id}/points
 * @description Get points for a specific receipt
 */
router.get('/receipts/:id/points', (req, res) => {
    const { id } = req.params; // Get the ID from the request parameters
    const receiptData = receiptsStore.get(id); // Get the receipt data from the store

    // If the receipt data is not found, return a 404 error
    if (!receiptData) {
        return res.status(404).json({ error: 'No receipt found for that id' });
    }

    // Calculate points if not already calculated
    if (receiptData.points === null) {
        receiptData.points = calculatePoints(receiptData.receipt);
        receiptsStore.set(id, receiptData);
    }

    // Return the points as per API spec
    res.json({ points: receiptData.points });
});

module.exports = router;
