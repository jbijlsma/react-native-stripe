const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/", (_, res) => {
  res.send("<h1>Welcome to the Stripe Payment API!</h1>");
});

router.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

router.get("/payment-methods", async (req, res) => {
  const paymentMethods = await stripe.paymentMethods.list({});

  return res.send(paymentMethods);
});

router.post("/payment-intents", async (req, res) => {
  try {
    const { amount, selectedPaymentMethod } = req.body;

    // immediately confirm the PaymentIntent
    // confirming is normally done by the user when he/she selects a payment method from the available options
    const confirmProps = selectedPaymentMethod
      ? {
          // to be able to confirm the selected payment method it has to be passed here
          payment_method_data: { type: selectedPaymentMethod },
          confirm: true,
        }
      : {};

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Integer, usd -> pennies, eur -> cents
      currency: "sgd",
      // here we specify the available payment methods (not very useful if we payment_method_data.type to the one we choose)
      payment_method_types: ["card", "paynow", "grabpay"],
      // to be able to confirm the selected payment method it has to be passed here
      // payment_method_data: { type: "paynow" },
      // confirm: true,
      ...confirmProps,
    });

    res.json({
      secretKey: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
      qrCodePngUri:
        paymentIntent.next_action?.paynow_display_qr_code?.image_url_png,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

router.get("/payment-link", async (req, res) => {
  const priceId = "price_1NInR2E0jVisloCuMyVUxhAF";
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // if you pass more optioins here, the screen will let the user choose: payment_method_types: ["paynow", "grabpay", "card"],
    payment_method_types: ["paynow", "card"],
  });

  res.send({ url: paymentLink.url });
});

module.exports = router;
