const express = require('express');
const {
  createOrder,
  placeOrder,
  cancelOrder,
  updatePaymentMethod,
  getOrders
} = require('../controllers/orderController');
const { verifyToken, filterByCountry } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, filterByCountry, getOrders);
router.post('/:id/place', verifyToken, filterByCountry, placeOrder);
router.post('/:id/cancel', verifyToken, filterByCountry, cancelOrder);
router.patch('/:id/payment', verifyToken, updatePaymentMethod);

module.exports = router;
