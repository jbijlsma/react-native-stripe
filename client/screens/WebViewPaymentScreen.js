import { useNavigation, useTheme } from "@react-navigation/native";
import { Button, View } from "react-native";

import { usePaymentApi } from "../hooks/usePaymentApi";

function WebViewPaymentScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { paymentBaseUri } = usePaymentApi();

  async function onPayHandler() {
    const res = await fetch(`${paymentBaseUri}/stripe/payment-link`);
    const paymentLink = await res.json();
    const paymentLinkUri = paymentLink.url;

    setTimeout(() => {
      navigation.navigate("StripeWebView", {
        // https://stripe.com/docs/payment-links/customer-info#customize-checkout-with-url-parameters
        stripePaymentLinkUrl: `${paymentLinkUri}?prefilled_email=jeroen%40bijlsma.com`,
      });
    }, 2000);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Button
        title="Pay with Payment Link (open in WebView)"
        onPress={onPayHandler}
      />
    </View>
  );
}

export default WebViewPaymentScreen;
