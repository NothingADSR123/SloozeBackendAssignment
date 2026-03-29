const express = require('express');
const { getRestaurants } = require('../controllers/restaurantController');
const { verifyToken, filterByCountry } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, filterByCountry, getRestaurants);

module.exports = router;
