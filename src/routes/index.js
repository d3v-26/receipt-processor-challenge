const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Receipt Processor web service!' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = router;
