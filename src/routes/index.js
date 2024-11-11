const express = require('express');
const router = express.Router();
const { validateReceiptMiddleware } = require('../middleware/validateReceipt');


router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Receipt Processor web service!' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

router.post('/receipts/process', validateReceiptMiddleware, (req, res) => {
    // Your receipt processing logic here
});

module.exports = router;
