const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/webhook", (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      // const paymentIntentSucceeded = event.data.object;
      console.log("payment_intent.succeeded event received");
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case "payment_intent.payment_failed":
      // const paymentIntentFailed = event.data.object;
      console.log("payment_intent.payment_failed event received");
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

module.exports = router;
