import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    setMessage(null); // Clear previous messages

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${window.location.origin}/completion`,
        },
      });

      // Handle different outcomes of the payment process
      if (result.error) {
        // Show error to your customer (e.g., payment details incomplete or invalid)
        setMessage(result.error.message);
      } else {
        // The payment has been processed!
        if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          setMessage("Payment succeeded!");
        } else {
          // Handle other statuses accordingly (e.g., requires_confirmation, requires_action)
          setMessage("Payment processing or further action required.");
        }
      }
    } catch (error) {
      // Network error or other issue
      setMessage("An error occurred, please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} id="submit">
        <span id="button-text">
          {isProcessing ? "Processing..." : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
