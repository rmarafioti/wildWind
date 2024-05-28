import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";

function Payment() {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(""); // State for handling amount

  useEffect(() => {
    fetch("/config").then(async (r) => {
      const { publishableKey } = await r.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  useEffect(() => {
    if (amount) {
      console.log("Sending amount to server:", amount);
      // Ensure amount is set before fetching
      fetch("/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Received from server:", data);
          setClientSecret(data.clientSecret);
        })
        .catch((error) => console.log("Error:", error));
    }
  }, [amount]); // Dependency on amount to fetch clientSecret

  return (
    <>
      <h1>React Stripe and the Payment Element</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        min="1"
      />
      {clientSecret && stripePromise ? (
        <Elements
          key={clientSecret}
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <CheckoutForm />
        </Elements>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}

export default Payment;
