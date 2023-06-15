import { useStripe } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { usePaymentApi } from "../hooks/usePaymentApi";

// Following the example:
// https://stripe.com/docs/payments/accept-a-payment?platform=react-native&ui=payment-sheet#react-native-customization
export default function PaymentScreen() {
  const { colors } = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function createStripePaymentIntent() {
    const baseUri = usePaymentApi();
    const uri = `${baseUri}/payments/intent`;

    try {
      const res = await fetch(`${uri}?amount=1850`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const paymentIntent = await res.json();

      if (paymentIntent.error) {
        Alert.alert("Payment API request failed", paymentIntent.error);
        return;
      }

      return {
        paymentIntent: paymentIntent.paymentIntent,
        ephemeralKey: paymentIntent.ephemeralKey,
        customer: paymentIntent.customer,
        publishableKey: paymentIntent.publishableKey,
      };
    } catch (err) {
      Alert.alert("Payment API request failed", err);
    }
  }

  async function onPressHandle() {
    const paymentIntent = await createStripePaymentIntent();

    const initRes = await initPaymentSheet({
      merchantDisplayName: "DotnetWorks",
      customerId: paymentIntent.customer,
      customerEphemeralKeySecret: paymentIntent.ephemeralKey,
      paymentIntentClientSecret: paymentIntent.paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: "Jane Doe",
      },
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
