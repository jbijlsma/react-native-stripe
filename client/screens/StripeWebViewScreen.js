import { StyleSheet } from "react-native";
import { View } from "react-native";
import { WebView } from "react-native-webview";

function StripeWebViewScreen({ route }) {
  const { stripePaymentLinkUrl } = route.params;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        originWhitelist={["*"]}
        source={{ uri: stripePaymentLinkUrl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  webview: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default StripeWebViewScreen;
