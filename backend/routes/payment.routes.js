const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.use(protect);

// @desc    Create Stripe payment intent
// @route   POST /api/v1/payments/create-payment-intent
router.post('/create-payment-intent', async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: { userId: req.user.id }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create PayPal order
// @route   POST /api/v1/payments/create-paypal-order
router.post('/create-paypal-order', async (req, res, next) => {
  try {
    const { amount, currency = 'USD' } = req.body;

    // In production, you would use PayPal SDK
    // This is a simplified example
    const order = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        }
      }],
      application_context: {
        brand_name: 'Event Management System',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`
      }
    };

    // Simulate PayPal order creation
    res.status(200).json({
      success: true,
      orderId: `PAYPAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;