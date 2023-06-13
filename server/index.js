const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get("/", (_, res) => {
  res.send("<h1>Welcome to the Payment API!</h1>");
});

app.post("/payments/intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount, // Integer, usd -> pennies, eur -> cents
      currency: "sgd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ paymentIntentClientSecret: paymentIntent.client_secret });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Payment API is listening on port", PORT);
});
