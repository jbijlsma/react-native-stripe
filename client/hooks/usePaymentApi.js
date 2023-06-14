import { Platform } from "react-native";

import { LOCAL_IP } from "@env";

export function usePaymentApi() {
  const server = Platform.OS === "ios" ? LOCAL_IP ?? "0.0.0.0" : "10.0.2.2";

  return `http://${server}:4242`;
}
