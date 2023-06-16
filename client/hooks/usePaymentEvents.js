import { useEffect, useState } from "react";
import EventSource from "react-native-sse";
import { usePaymentApi } from "./usePaymentApi";

export function usePaymentEvents() {
  const { paymentBaseUri } = usePaymentApi();
  const [latestStateUpdate, setLatestStateUpdate] = useState(null);

  useEffect(() => {
    const es = new EventSource(`${paymentBaseUri}/stripe-events/events`);
    const listener = (event) => {
      if (event.type === "open") {
        console.log("Open SSE connection.");
      } else if (event.type === "message") {
        const eventObj = JSON.parse(event.data);
        setLatestStateUpdate(eventObj);
      } else if (event.type === "error") {
        console.error("Connection error:", event.message);
      } else if (event.type === "exception") {
        console.error("Error:", event.message, event.error);
      }
    };
    es.addEventListener("open", listener);
    es.addEventListener("message", listener);
    es.addEventListener("error", listener);
    return () => {
      es.removeAllEventListeners();
      es.close();
    };
  }, []);

  return latestStateUpdate;
}
