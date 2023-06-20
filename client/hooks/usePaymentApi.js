import { Platform, Alert } from "react-native";

import { LOCAL_IP } from "@env";

export function usePaymentApi() {
  const server = Platform.OS === "ios" ? LOCAL_IP ?? "0.0.0.0" : "10.0.2.2";
  const paymentBaseUri = `http://${server}:4242`;

  const createStripePaymentIntent = async (
    selectedPaymentMethod,
    connectedAccountId
  ) => {
    const uri = `${paymentBaseUri}/stripe/payment-intents`;

    try {
      const res = await fetch(uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 600,
          selectedPaymentMethod,
          connectedAccountId,
        }),
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

  const approveStripePayNowPaymentIntent = async (
    paymentAttemptId,
    merchantId
  ) => {
    const uri = `${paymentBaseUri}/stripe/payment-intents/approve?paymentAttemptId=${paymentAttemptId}&merchantId=${
      merchantId ?? ""
    }`;
    await fetch(uri);
  };

  const declineStripePayNowPaymentIntent = async (
    paymentAttemptId,
    merchantId
  ) => {
    const uri = `${paymentBaseUri}/stripe/payment-intents/decline?paymentAttemptId=${paymentAttemptId}&merchantId=${
      merchantId ?? ""
    }`;
    await fetch(uri);
  };

  const getStripeLinkedAccounts = async () => {
    const res = await fetch(`${paymentBaseUri}/stripe/accounts`);
    return await res.json();
  };

  const createStripeLinkedAccount = async (returnUrl) => {
    try {
      const res = await fetch(`${paymentBaseUri}/stripe/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshUrl: returnUrl, returnUrl: returnUrl }),
      });

      const { accountLinkUrl } = await res.json();

      return accountLinkUrl;
    } catch (err) {
      Alert.alert("Payment API request failed", err);
    }
  };

  return {
    paymentBaseUri,
    createStripePaymentIntent,
    approveStripePayNowPaymentIntent,
    declineStripePayNowPaymentIntent,
    getStripeLinkedAccounts,
    createStripeLinkedAccount,
  };
}
