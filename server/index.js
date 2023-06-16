const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = 4242;

// Import your various routers
const stripeRouter = require("./routes/stripe");
const stripeGrabRouter = require("./routes/stripe-grab");
const stripeEventsRouter = require("./routes/stripe-events");

// use CORS for all
app.use(cors());

// use raw parser for stripe events
app.use("/stripe-events/", express.raw({ type: "*/*" }), stripeEventsRouter);

// use express.json parser for all other routes
app.use(express.json());

// set up the rest of the routes
app.use("/stripe", stripeRouter);
app.use("/stripe-grab", stripeGrabRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Payment API is listening on port", PORT);
});
