const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// to keep track of connected clients for Server Side Events (SSE)
let clients = [];

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
      console.log("payment_intent.succeeded event received");
      const paymentIntentSucceeded = event.data.object;
      sendPaymentIntentStatusUpdateToAll({
        paymentIntentId: paymentIntentSucceeded.id,
        status: "succeeded",
      });
      break;
    case "payment_intent.payment_failed":
      console.log("payment_intent.payment_failed event received");
      const paymentIntentFailed = event.data.object;
      sendPaymentIntentStatusUpdateToAll({
        paymentIntentId: paymentIntentFailed.id,
        status: "failed",
      });
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

const sendPaymentIntentStatusUpdateToAll = (statusUpdate) => {
  clients.forEach((client) => {
    console.log("Sending SSE message to client " + client.id);
    return client.response.write(`data: ${JSON.stringify(statusUpdate)}\n\n`);
  });
};

router.get("/events", (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  // const data = `data: ${JSON.stringify({ status: "OK" })}\n\n`;
  // res.write(data);

  // if the user would be authenticated we would use that userId here
  const clientId = Date.now();

  // note that we are caching the response object so we can use it to send messages from the server
  // to connected clients. The connection stays open because we returned the Connection: "keep-alive" header
  const newClient = {
    id: clientId,
    response: res,
  };

  clients.push(newClient);

  // if the request closes, so does the response so its fine to
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
});

module.exports = router;
