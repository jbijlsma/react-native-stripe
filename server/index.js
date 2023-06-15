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

app.get("/payments/intent", async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: "jeroen@bijlsma.com",
    });
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.query.amount, // Integer, usd -> pennies, eur -> cents
      currency: "sgd",
      // automatic_payment_methods: {
      //   enabled: true,
      // },
      // payment_method_types: ["card", "paynow", "grabpay"],
      payment_method_types: ["grabpay", "paynow"],
      customer: customer.id,
      // card: {
      //   request_three_d_secure: "automatic",
      // },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
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
