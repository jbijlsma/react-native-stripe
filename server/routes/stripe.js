const express = require("express");
const router = express.Router();
const axios = require("axios");
const url = require("url");

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
      // here we specify the available payment methods
      payment_method_types: ["card", "paynow", "grabpay"],
      ...confirmProps,
    });

    const nextUriString =
      paymentIntent.next_action?.paynow_display_qr_code?.data;
    let nextUri = nextUriString ? url.parse(nextUriString, true) : null;
    const paymentAttemptId = nextUri?.query?.payment_attempt;

    res.json({
      id: paymentIntent.client_id,
      paymentAttemptId: paymentAttemptId,
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

const approveDeclinePayNowPaymentIntentBaseUri = `https://pm-hooks.stripe.com/paynow/test/payment?merchant_id=${process.env.MERCHANT_ID}`;

router.get("/payment-intents/approve", async (req, res) => {
  const { paymentAttemptId } = req.query;
  const uri = `${approveDeclinePayNowPaymentIntentBaseUri}&external_transaction_id=${paymentAttemptId}&testmode_status=SUCCESS`;
  console.log(uri);
  await axios.get(uri);

  res.sendStatus(200);
});

router.get("/payment-intents/decline", async (req, res) => {
  const { paymentAttemptId } = req.query;
  const uri = `${approveDeclinePayNowPaymentIntentBaseUri}&external_transaction_id=${paymentAttemptId}&testmode_status=FAIL`;
  console.log(uri);
  await axios.get(uri);

  res.sendStatus(200);
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
