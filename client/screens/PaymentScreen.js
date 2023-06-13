import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button, Alert, Platform } from "react-native";

import { STRIPE_PUBLIC_KEY } from "@env";

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function getStripePaymentIntentClientSecret() {
    const server = Platform.OS === "ios" ? "localhost" : "10.0.2.2";
    const uri = `http://${server}:3000/payments/intent`;

    try {
      const res = await fetch(uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 1750 }),
      });

      const json = await res.json();

      if (json.error) {
        Alert.alert("Payment API request failed", json.error);
        return;
      }

      return json.paymentIntentClientSecret;
    } catch (err) {
      Alert.alert("Payment API request failed", err);
    }
  }

  async function onPressHandle() {
    const secret = await getStripePaymentIntentClientSecret();

    const initRes = await initPaymentSheet({
      merchantDisplayName: "DotnetWorks",
      paymentIntentClientSecret: secret,
    });

    if (initRes.error) {
      Alert.alert("Something went wrong", initRes.error);
      return;
    }

    const paymentRes = await presentPaymentSheet();

    if (paymentRes.error) {
      Alert.alert("Payment Failed", paymentRes.error.message);
    } else {
      Alert.alert("Success", "Payment succeeded!");
    }
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
      <View style={styles.container}>
        <Button
          title="Make Stripe Payment"
          onPress={onPressHandle}
        />
        <StatusBar style="auto" />
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
