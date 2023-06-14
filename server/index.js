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

    res.json({ paymentIntentClientSecret: paymentIntent.client_secret });
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

app.listen(PORT, "0.0.0.0", () => {
  console.log("Payment API is listening on port", PORT);
});
