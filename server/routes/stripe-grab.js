const axios = require("axios");
const url = require("url");

const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getNonce = async (stripeAuthorizeRedirectUri) => {
  const res = await axios.get(stripeAuthorizeRedirectUri);

  const xLocationHeader = res.headers["x-location"];
  let location = url.parse(xLocationHeader, true);
  const nonce = location.query.redirect_uri.split("/").pop();

  return nonce;
};

router.post("/payment-intents", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Integer, usd -> pennies, eur -> cents
      currency: "sgd",
      // here we specify the available payment methods (not very useful if we payment_method_data.type to the one we choose)
      payment_method_types: ["grabpay"],
      // to be able to confirm the selected payment method it has to be passed here
      confirm: true,
      payment_method_data: { type: "grabpay" },
      // need to provide some dummy return_url
      return_url: "http://localhost:3000",
    });

    const redirectUrl = paymentIntent.next_action?.redirect_to_url?.url;
    const nonce = await getNonce(redirectUrl);

    res.json({
      secretKey: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
      nonce: nonce,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

const approveDeclinePaymentIntentBaseUri = `https://pm-redirects.stripe.com/return/${process.env.MERCHANT_ID}`;
const approveDeclineConfig = {
  method: "GET",
  // we don't want to follow the 302 redirect
  maxRedirects: 0,
  // axios normally throws an exception for 302 status code
  validateStatus: null,
};

router.get("/payment-intents/:nonce/approve", async (req, res) => {
  try {
    const { nonce } = req.params;
    const uri = `${approveDeclinePaymentIntentBaseUri}/${nonce}?code=foo&state=bar`;
    await axios.request({
      url: uri,
      ...approveDeclineConfig,
    });

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/payment-intents/:nonce/decline", async (req, res) => {
  try {
    const { nonce } = req.params;
    const uri = `${approveDeclinePaymentIntentBaseUri}/${nonce}?error=baz`;
    await axios.request({
      url: uri,
      ...approveDeclineConfig,
    });

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
