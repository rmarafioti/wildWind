const express = require("express");
const app = express();
const { resolve } = require("path");
require("dotenv").config({ path: "./.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.use(express.static(process.env.STATIC_DIR));
app.use(express.json());

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  console.log("Received amount from client:", req.body.amount);
  const { amount } = req.body;

  // Validate the amount to ensure it's a positive number and within reasonable bounds
  if (!amount || amount <= 0 || amount > 10000) {
    // Example: amount must not exceed 10,000 units
    return res
      .status(400)
      .json({ error: { message: "Invalid amount specified" } });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "USD",
      amount: Math.round(amount * 100), // Convert amount to cents
      payment_method_types: ["card"],
      automatic_payment_methods: { enabled: true },
    });

    console.log("PaymentIntent created with ID:", paymentIntent.id); // Log PaymentIntent details

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.error("Error creating PaymentIntent:", e);
    res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
