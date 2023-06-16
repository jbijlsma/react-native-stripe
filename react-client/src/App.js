import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import "./App.css";
import Payment from "./components/Payment";

function App() {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4242/stripe/config").then(async (res) => {
      const { publishableKey } = await res.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  return (
    <div className="App">
      <Payment stripePromise={stripePromise} />
    </div>
  );
}

export default App;
