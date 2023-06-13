import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Appearance, useColorScheme } from "react-native";

import PaymentScreen from "./screens/PaymentScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={PaymentScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
