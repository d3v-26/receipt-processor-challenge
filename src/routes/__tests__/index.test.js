const request = require('supertest');
const express = require('express');
const router = require('../index');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/', router);

describe('Receipt Processor Routes', () => {
  // Test welcome route
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Welcome to the Receipt Processor web service!'
      });
    });
  });

  // Test health check route
  describe('GET /health', () => {
    it('should return OK status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });

  // Test receipt processing route
  describe('POST /receipts/process', () => {
    const validReceipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        {
          shortDescription: "Mountain Dew 12PK",
          price: "6.49"
        }
      ],
      total: "6.49"
    };

    const detailedReceipt = {
        retailer: "M&M Corner Market",
        purchaseDate: "2022-03-20",
        purchaseTime: "14:33",
        items: [
          {
            shortDescription: "Gatorade",
            price: "2.25"
          },
          {
            shortDescription: "Gatorade",
            price: "2.25"
          },
          {
            shortDescription: "Coke Zero",
            price: "1.25"
          },
          {
            shortDescription: "Hersheys Bar",
            price: "1.00"
          }
        ],
        total: "6.75"
    };

    it('should process valid receipt and return ID', async () => {
      const response = await request(app)
        .post('/receipts/process')
        .send(validReceipt);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
    });

    it('should reject invalid receipt', async () => {
      const invalidReceipt = { ...validReceipt, retailer: '' };
      const response = await request(app)
        .post('/receipts/process')
        .send(invalidReceipt);
      
      expect(response.status).toBe(400);
    });

    it('should process detailed receipt and calculate correct points', async () => {
        // First, process the receipt
        const processResponse = await request(app)
          .post('/receipts/process')
          .send(detailedReceipt);
        
        expect(processResponse.status).toBe(200);
        expect(processResponse.body).toHaveProperty('id');
        
        // Then, get the points
        const pointsResponse = await request(app)
          .get(`/receipts/${processResponse.body.id}/points`);
        
        expect(pointsResponse.status).toBe(200);
        expect(pointsResponse.body).toHaveProperty('points');
        
        // Verify expected points calculation:
        // - 6.75 total = 0 points (not round dollar)
        // - Retailer name (M&M Corner Market) has 14 alphanumeric chars = 14 points
        // - 4 items = 10 points
        // - Purchase time (14:33) is between 2:00 and 4:00 PM = 10 points
        // - Day is 20 = 0 points (not odd)
        // - 6.75 mod 0.25 == 0 => 25 points
        // - Coke Zero has 9 chars => ceiling(1.25 * 0.2) = 1 points
        // - Hershey's Bar has 15 chars => ceiling(1.00 * 0.2) = 1 points
        // Total expected: 14 + 10 + 10 + 25 + 1 + 1 = 61 points
        expect(pointsResponse.body.points).toBe(61);
    });
  });

  // Test points retrieval route
  describe('GET /receipts/:id/points', () => {
    let receiptId;

    // Setup: create a receipt first
    beforeEach(async () => {
      const validReceipt = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          {
            shortDescription: "Mountain Dew 12PK",
            price: "6.49"
          }
        ],
        total: "6.49"
      };

      const response = await request(app)
        .post('/receipts/process')
        .send(validReceipt);
      
      receiptId = response.body.id;
    });

    it('should return points for valid receipt ID', async () => {
      const response = await request(app)
        .get(`/receipts/${receiptId}/points`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('points');
      expect(typeof response.body.points).toBe('number');
    });

    it('should return 404 for non-existent receipt ID', async () => {
      const response = await request(app)
        .get('/receipts/non-existent-id/points');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'No receipt found for that id'
      });
    });
  });
});
