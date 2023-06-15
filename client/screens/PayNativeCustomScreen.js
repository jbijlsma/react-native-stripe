import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Button, View, Image, StyleSheet, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

import { usePaymentApi } from "../hooks/usePaymentApi";

function PayNativeCustomScreen() {
  const { colors } = useTheme();
  const { createStripePaymentIntent } = usePaymentApi();
  const [_, requestPermission] = MediaLibrary.usePermissions();

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

  const downloadQrCode = async () => {
    try {
      const date = new Date();
      const dateString = date.toISOString();
      let fileUri = FileSystem.documentDirectory + `${dateString}.png`;
      const res = await FileSystem.downloadAsync(qrCodePngUri, fileUri);
      return res.uri;
    } catch (err) {
      Alert.alert("Oeps", "Failed to download QR code");
      console.log("Download failed: ", err);
    }
  };

  const saveQrCode = async (fileUri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync("Download");
      if (album == null) {
        await MediaLibrary.createAlbumAsync("Download", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (err) {
      Alert.alert("Oeps", "Failed to save QR code");
      console.log("Failed to save QR code: ", err);
    }
  };

  async function saveQrCodeHandler() {
    const { status } = await requestPermission();
    if (status !== "granted") {
      Alert.alert(
        "Ouch",
        "We need permission to save the QR code in your photos"
      );
      return;
    }

    const fileUri = await downloadQrCode();

    if (fileUri) {
      await saveQrCode(fileUri);

      Alert.alert("Oh yeah", "QR code was saved to your photos");
    }
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
          <View
            style={[
              styles.payNowInnerContainer,
              { backgroundColor: colors.background },
            ]}
          >
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
            <View style={styles.saveBtnContainer}>
              <Button
                title="Save QR Code"
                onPress={saveQrCodeHandler}
              />
            </View>
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
  saveBtnContainer: {
    paddingTop: 12,
  },
});

export default PayNativeCustomScreen;
