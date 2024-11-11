const { validateReceipt } = require('../schemas/receipt');

/**
 * Express middleware to validate receipt requests
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validateReceiptMiddleware = (req, res, next) => {
    if (!validateReceipt(req.body)) {
        return res.status(400).json({ error: 'The receipt is invalid' });
    }
    next();
};

module.exports = { validateReceiptMiddleware };
