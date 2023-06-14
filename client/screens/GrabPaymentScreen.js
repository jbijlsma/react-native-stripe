import { useTheme } from "@react-navigation/native";
import { Button, View, Alert } from "react-native";
import { useConfirmPayment } from "@stripe/stripe-react-native";

import { LOCAL_IP } from "@env";

function GrabPaymentScreen() {
  const { colors } = useTheme();
  const { confirmPayment, loading } = useConfirmPayment();

  async function getStripePaymentIntentClientSecret() {
    const server = Platform.OS === "ios" ? LOCAL_IP ?? "0.0.0.0" : "10.0.2.2";
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

  async function onPayHandler() {
    const secret = await getStripePaymentIntentClientSecret();

    const billingDetails = {
      name: "John Doe",
    };

    const { error, paymentIntent } = await confirmPayment(secret, {
      paymentMethodType: "GrabPay",
      paymentMethodData: {
        billingDetails,
      },
    });

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      console.log("Payment confirmation error", error.message);
    } else if (paymentIntent) {
      Alert.alert("Success", "The payment was confirmed successfully!");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.backgroundColor,
      }}
    >
      <Button
        title="Pay with GrabPay"
        onPress={onPayHandler}
      />
    </View>
  );
}

export default GrabPaymentScreen;
