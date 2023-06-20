import { useEffect, useState } from "react";
import { View, Text, Button, FlatList, RefreshControl } from "react-native";
import { useTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { usePaymentApi } from "../hooks/usePaymentApi";

function ConnectedAccountsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);
  const [initialUrl, setInitialUrl] = useState();
  const [refreshing, setRefreshing] = useState(false);

  const url = Linking.useURL();

  const { colors } = useTheme();
  const { paymentBaseUri, getStripeLinkedAccounts, createStripeLinkedAccount } =
    usePaymentApi();

  const fetchStripeAccounts = async () => {
    setRefreshing(true);

    try {
      const stripeAccounts = await getStripeLinkedAccounts();
      setAccounts(stripeAccounts);
    } catch (e) {
      setRefreshing(false);
      Alert.alert("Something went wrong", e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUrl = async () => {
    if (url) {
      const parsedUrl = Linking.parse(url);
      if (parsedUrl?.queryParams && parsedUrl.queryParams["account-created"]) {
        WebBrowser.dismissBrowser();
        if (initialUrl) {
          Linking.openURL(initialUrl);
        }
        await fetchStripeAccounts();
      }
    }
  };

  useEffect(() => {
    const storeInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        setInitialUrl(url);
      }
    };

    storeInitialUrl();
    fetchStripeAccounts();
  }, []);

  useEffect(() => {
    handleUrl();
  }, [url]);

  async function addAccountHandler() {
    const accountLink = await createStripeLinkedAccount(
      `${paymentBaseUri}/account-created?localReturnUrl=${initialUrl}?account-created=true`
    );
    let result = await WebBrowser.openBrowserAsync(accountLink);
    console.log(result);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 32,
      }}
    >
      <View style={{ padding: 12 }}>
        <Button
          title="Add account"
          onPress={addAccountHandler}
        />
      </View>

      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStripeAccounts}
          />
        }
        contentContainerStyle={{
          flex: 1,
        }}
        data={accounts}
        keyExtractor={(account) => account.id}
        renderItem={(itemData) => {
          const account = itemData.item;
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                margin: 12,
                borderRadius: 12,
                backgroundColor: colors.card,
              }}
            >
              <Text style={{ color: colors.text }}>{account.name}</Text>
              <Button
                title="Pay"
                onPress={() =>
                  navigation.navigate("PayNativeCustomConnectedAccount", {
                    connectedAccountId: account.id,
                  })
                }
              />
            </View>
          );
        }}
      ></FlatList>
    </View>
  );
}

export default ConnectedAccountsScreen;
