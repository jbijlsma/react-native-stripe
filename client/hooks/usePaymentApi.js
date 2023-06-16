import { Platform, Alert } from "react-native";

import { LOCAL_IP } from "@env";

export function usePaymentApi() {
  const server = Platform.OS === "ios" ? LOCAL_IP ?? "0.0.0.0" : "10.0.2.2";
  const paymentBaseUri = `http://${server}:4242`;

  const createStripePaymentIntent = async (selectedPaymentMethod) => {
    const uri = `${paymentBaseUri}/stripe/payment-intents`;

    try {
      const res = await fetch(uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 600, selectedPaymentMethod }),
      });

      const paymentIntent = await res.json();

      if (paymentIntent.error) {
        Alert.alert("Payment API request failed", paymentIntent.error);
        return;
      }

      return paymentIntent;
    } catch (err) {
      Alert.alert("Payment API request failed", err);
    }
  };

  const approveStripePayNowPaymentIntent = async (paymentAttemptId) => {
    await fetch(
      `${paymentBaseUri}/stripe/payment-intents/approve?paymentAttemptId=${paymentAttemptId}`
    );
  };

  const declineStripePayNowPaymentIntent = async (paymentAttemptId) => {
    await fetch(
      `${paymentBaseUri}/stripe/payment-intents/decline?paymentAttemptId=${paymentAttemptId}`
    );
  };

  return {
    paymentBaseUri,
    createStripePaymentIntent,
    approveStripePayNowPaymentIntent,
    declineStripePayNowPaymentIntent,
  };
}
