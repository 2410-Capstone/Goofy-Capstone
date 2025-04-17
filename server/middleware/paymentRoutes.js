const express = require('express');
const router = express.Router();
const { createStripePaymentIntent } = require('../db/payments');

router.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await createStripePaymentIntent(amount);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
