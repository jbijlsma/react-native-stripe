import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";

import { STRIPE_PUBLIC_KEY } from "@env";

import PaymentScreen from "./screens/PaymentScreen";
import GrabPaymentScreen from "./screens/GrabPaymentScreen";
import StripeWebViewScreen from "./screens/StripeWebViewScreen";
import WebViewPaymentScreen from "./screens/WebViewPaymentScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator initialRouteName="WebViewPayment">
          <Stack.Screen
            name="Pay"
            component={PaymentScreen}
          />
          <Stack.Screen
            name="GrabPay"
            component={GrabPaymentScreen}
          />
          <Stack.Screen
            name="WebViewPayment"
            component={WebViewPaymentScreen}
          />
          <Stack.Screen
            name="StripeWebView"
            component={StripeWebViewScreen}
            options={{ presentation: "modal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
