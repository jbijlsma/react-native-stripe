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
    const { amount, selectedPaymentMethod, connectedAccountId } = req.body;

    const postData = {
      amount: amount, // Integer, usd -> pennies, eur -> cents
      currency: "sgd",
      // here we specify the available payment methods
      payment_method_types: ["card", "paynow", "grabpay"],
      // immediately confirm the PaymentIntent
      // confirming is normally done by the user when he/she selects a payment method from the available options
      ...(selectedPaymentMethod && { confirm: true }),
      // to be able to confirm the selected payment method it has to be passed here
      ...(selectedPaymentMethod && {
        payment_method_data: { type: selectedPaymentMethod },
      }),
      // on_behalf_of is not working, so we pass the Stripe-Account header instead
      // since we cannot specify this header when using the node library
      // we use the Stripe API instead
    };
    const { data: paymentIntent } = await axios({
      method: "POST",
      auth: {
        username: process.env.STRIPE_SECRET_KEY,
      },
      url: "https://api.stripe.com/v1/payment_intents",
      data: postData,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        ...(connectedAccountId && { "Stripe-Account": connectedAccountId }),
      },
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

const approveDeclinePayNowPaymentIntentBaseUri = `https://pm-hooks.stripe.com/paynow/test/payment`;

router.get("/payment-intents/approve", async (req, res) => {
  const { paymentAttemptId } = req.query;
  let merchantId =
    req.query.merchantId === ""
      ? process.env.MERCHANT_ID
      : req.query.merchantId;
  console.log("merchantId: " + merchantId);

  const uri = `${approveDeclinePayNowPaymentIntentBaseUri}?merchant_id=${merchantId}&external_transaction_id=${paymentAttemptId}&testmode_status=SUCCESS`;
  console.log(uri);
  await axios.get(uri);

  res.sendStatus(200);
});

router.get("/payment-intents/decline", async (req, res) => {
  const { paymentAttemptId } = req.query;
  let merchantId =
    req.query.merchantId === ""
      ? process.env.MERCHANT_ID
      : req.query.merchantId;
  console.log("merchantId: " + merchantId);

  const uri = `${approveDeclinePayNowPaymentIntentBaseUri}?merchant_id=${merchantId}&external_transaction_id=${paymentAttemptId}&testmode_status=FAIL`;
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

router.get("/accounts", async (req, res) => {
  const response = await stripe.accounts.list();
  const accounts = response.data;
  const mappedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.business_profile.name,
  }));
  console.log(mappedAccounts);
  res.send(mappedAccounts);
});

const createAccount = async () => {
  const postData = {
    type: "express",
    email: "customer@customerdomain.com",
    country: "SG",
    capabilities: {
      paynow_payments: {
        requested: true,
      },
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
    business_type: "company",
    business_profile: {
      mcc: "7941",
      url: "www.dotnet-works.com",
    },
    company: {
      phone: "+6500000000",
      name: "JEROEN FOR A CAUSE",
      tax_id: "T11SS0099L",
      address: {
        line1: "Address Line 1",
        postal_code: 123456,
      },
    },
  };

  const { data: account } = await axios({
    method: "POST",
    auth: {
      username: process.env.STRIPE_SECRET_KEY,
    },
    url: "https://api.stripe.com/v1/accounts",
    data: postData,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });

  return account;
};

const createAccountLink = async (accountId, refreshUrl, returnUrl) => {
  const postData = {
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  };

  const { data: accountLink } = await axios({
    method: "POST",
    auth: {
      username: process.env.STRIPE_SECRET_KEY,
    },
    url: "https://api.stripe.com/v1/account_links",
    data: postData,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });

  return accountLink;
};

router.post("/accounts", async (req, res) => {
  const { refreshUrl, returnUrl } = req.body;

  const { id: accountId } = await createAccount();
  const accountLink = await createAccountLink(accountId, refreshUrl, returnUrl);
  const accountLinkUrl = accountLink.url;

  console.log(accountLinkUrl);

  res.send({ accountLinkUrl });
});

module.exports = router;
