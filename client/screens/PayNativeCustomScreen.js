import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Button, View, Image, StyleSheet, Alert } from "react-native";

import { usePaymentApi } from "../hooks/usePaymentApi";

function PayNativeCustomScreen() {
  const { colors } = useTheme();
  const { createStripePaymentIntent } = usePaymentApi();

  const [qrCodePngUri, setQrCodePngUri] = useState(null);

  async function onPayHandler() {
    const paymentIntent = await createStripePaymentIntent("paynow");

    if (!paymentIntent.qrCodePngUri) {
      Alert.alert(
        "Oeps",
        "The PaymentIntent returned does not contain a QR code link. Was the PaymentIntent confirmed?"
      );
    }

    setQrCodePngUri(paymentIntent.qrCodePngUri);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <Button
        title="Pay with PayNow"
        onPress={onPayHandler}
      />

      {qrCodePngUri && (
        <View style={styles.payNowOuterContainer}>
          <View style={styles.payNowInnerContainer}>
            <Image
              style={styles.payNowLogo}
              source={require("../assets/paynow.png")}
              resizeMode="contain"
            />
            <Image
              source={{
                uri: qrCodePngUri,
              }}
              style={styles.payNowQrCode}
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  payNowOuterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
  },
  payNowInnerContainer: {
    width: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
  },
  payNowLogo: {
    height: 60,
    margin: 12,
  },
  payNowQrCode: {
    height: 300,
    width: 300,
  },
});

export default PayNativeCustomScreen;
