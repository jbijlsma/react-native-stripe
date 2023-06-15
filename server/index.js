const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 4242;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_, res) => {
  res.send("<h1>Welcome to the Payment API!</h1>");
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

app.get("/payment-methods", async (req, res) => {
  const paymentMethods = await stripe.paymentMethods.list({});

  return res.send(paymentMethods);
});

app.post("/payment-intents", async (req, res) => {
  try {
    const { amount, selectedPaymentMethod } = req.body;

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

app.get("/payment-link", async (req, res) => {
  const priceId = "price_1NInR2E0jVisloCuMyVUxhAF";
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // if you pass more optioins here, the screen will let the user choose: payment_method_types: ["paynow", "grabpay", "card"],
    payment_method_types: ["paynow"],
  });

  res.send({ url: paymentLink.url });
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Payment API is listening on port", PORT);
});
