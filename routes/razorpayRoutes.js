const express = require('express');
     const Razorpay = require('razorpay');
     const { verifyToken } = require('../middlewares/auth');
     require('dotenv').config();
     const router = express.Router();

     const razorpay = new Razorpay({
       key_id: process.env.RAZORPAY_KEY_ID,
       key_secret: process.env.RAZORPAY_KEY_SECRET
     });

     // Create Razorpay order
     router.post('/create', verifyToken, async (req, res) => {
       const { amount } = req.body; // Amount in paise
       try {
         const options = {
           amount: amount * 100, // Convert to paise
           currency: 'INR',
           receipt: `receipt_${req.user.id}_${Date.now()}`,
           payment_capture: 1
         };

         const order = await razorpay.orders.create(options);
         res.json({
           order_id: order.id,
           amount: order.amount,
           currency: order.currency,
           userId: req.user.id
         });
       } catch (err) {
         console.error('Create Razorpay order error:', err.stack);
         res.status(500).json({ error: 'Payment creation failed' });
       }
     });

     // Verify payment
     router.post('/verify', verifyToken, async (req, res) => {
       const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
       try {
         // Implement signature verification if needed
         res.json({ message: 'Payment verified', razorpay_order_id, razorpay_payment_id });
       } catch (err) {
         console.error('Verify payment error:', err.stack);
         res.status(500).json({ error: 'Payment verification failed' });
       }
     });

     module.exports = router;
