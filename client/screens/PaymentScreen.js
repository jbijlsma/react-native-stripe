import { useStripe } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { usePaymentApi } from "../hooks/usePaymentApi";

export default function PaymentScreen() {
  const { colors } = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function getStripePaymentIntentClientSecret() {
    const baseUri = usePaymentApi();
    const uri = `${baseUri}/payments/intent`;

    try {
      const res = await fetch(`${uri}?amount=1850`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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
      allowsDelayedPaymentMethods: true,
    });

    if (initRes.error) {
      Alert.alert("Something went wrong", initRes.error);
      return;
    }

    const paymentRes = await presentPaymentSheet();

    if (paymentRes.error) {
      console.log(JSON.stringify(paymentRes));

      Alert.alert("Payment Failed", paymentRes.error.message);
    } else {
      Alert.alert("Success", "Payment succeeded!");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Button
        title="Make Stripe Payment"
        onPress={onPressHandle}
      />
      <StatusBar style="auto" />
    </View>
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
