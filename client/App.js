import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";

import { STRIPE_PUBLIC_KEY } from "@env";

import PayNativeCustomScreen from "./screens/PayNativeCustomScreen";
import StripeWebViewScreen from "./screens/StripeWebViewScreen";
import WebViewPaymentScreen from "./screens/WebViewPaymentScreen";
import PayNativePaymentSheetScreen from "./screens/PayNativePaymentSheetScreen";
import ConnectedAccountsScreen from "./screens/ConnectedAccountsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  function PayWebViewStack() {
    return (
      <Stack.Navigator>
        <Tab.Screen
          name="PayWebView"
          component={WebViewPaymentScreen}
          options={{ title: "WebView" }}
        />
        <Tab.Screen
          name="StripeWebView"
          component={StripeWebViewScreen}
          options={{ presentation: "modal", title: "Confirm" }}
        />
      </Stack.Navigator>
    );
  }

  function ConnectedAccountStack() {
    return (
      <Stack.Navigator>
        <Tab.Screen
          name="ConnectedAccounts"
          component={ConnectedAccountsScreen}
          options={{
            title: "Connected Accounts",
          }}
        />
        <Tab.Screen
          name="PayNativeCustomConnectedAccount"
          component={PayNativeCustomScreen}
          options={{
            title: "Native (Custom)",
          }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          initialRouteName="PayNativePaymentSheet"
          screenOptions={{
            tabBarItemStyle: {
              margin: 4,
            },
            tabBarLabelStyle: {
              // padding: 12,
            },
            tabBarStyle: {
              width: "auto",
            },
          }}
        >
          <Tab.Screen
            name="PayNativePaymentSheet"
            component={PayNativePaymentSheetScreen}
            options={{
              title: "Native (PaymentSheet)",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="ios-card"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="PayWebViewStack"
            component={PayWebViewStack}
            options={{
              headerShown: false,
              title: "WebView",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="ios-browsers"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="PayNativeCustom"
            component={PayNativeCustomScreen}
            options={{
              title: "Native (Custom)",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="logo-usd"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="ConnectedAccountsStack"
            component={ConnectedAccountStack}
            options={{
              headerShown: false,
              tabBarLabel: "Connected Accounts",
              title: "Connected Accounts",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="person-circle"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
