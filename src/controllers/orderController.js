const Order = require('../models/Order');
const Joi = require('joi');

// Validation schemas
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().min(1).required()
    })
  ).min(1).required()
});

const updatePaymentSchema = Joi.object({
  paymentMethod: Joi.string().required()
});

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { items } = req.body;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      status: 'CREATED',
      country: req.user.country
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Place order (checkout + payment)
exports.placeOrder = async (req, res, next) => {
  try {
    // Check role - only Admin and Manager can place orders
    if (req.user.role === 'Member') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Members cannot place orders.'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      ...req.countryFilter
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    if (order.status !== 'CREATED') {
      return res.status(400).json({
        success: false,
        message: `Cannot place order with status: ${order.status}`
      });
    }

    order.status = 'PLACED';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    // Check role - only Admin and Manager can cancel orders
    if (req.user.role === 'Member') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Members cannot cancel orders.'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      ...req.countryFilter
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    order.status = 'CANCELLED';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res, next) => {
  try {
    // Check role - only Admin can update payment method
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin can update payment method.'
      });
    }

    const { error } = updatePaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { paymentMethod } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentMethod = paymentMethod;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (filtered by country for Manager/Member)
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find(req.countryFilter)
      .populate('userId', 'name email role country')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
