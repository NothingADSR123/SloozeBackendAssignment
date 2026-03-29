const Restaurant = require('../models/Restaurant');

// Get all restaurants with menu items (filtered by country for Manager/Member)
exports.getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find(req.countryFilter);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};
