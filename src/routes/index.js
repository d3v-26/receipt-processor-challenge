const express = require('express');
const router = express.Router();
const { validateReceiptMiddleware } = require('../middleware/validateReceipt');
const { v4: uuidv4 } = require('uuid'); 
const { calculatePoints } = require('../utils/calculatePoints');

const receiptsStore = new Map();


router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Receipt Processor web service!' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

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
    const { id } = req.params;
    const receiptData = receiptsStore.get(id);

    if (!receiptData) {
        return res.status(404).json({ error: 'No receipt found for that id' });
    }

    // Calculate points if not already calculated
    if (receiptData.points === null) {
        receiptData.points = calculatePoints(receiptData.receipt);
        receiptsStore.set(id, receiptData);
    }

    res.json({ points: receiptData.points });
});

module.exports = router;
