import { useEffect, useState } from "react";

import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";

function Payment(props) {
  const { stripePromise } = props;
  const [clientSecret, setClientSecret] = useState("");

  const createPaymentIntent = async () => {
    const res = await fetch(
      "http://localhost:4242/payments/intent?amount=1750"
    );

    const json = await res.json();

    setClientSecret(json.paymentIntentClientSecret);
  };

  useEffect(() => {
    createPaymentIntent();
  }, []);

  return (
    <>
      <h1>Payment</h1>
      {clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default Payment;
