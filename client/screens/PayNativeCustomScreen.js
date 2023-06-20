import PayNowPayment from "../components/PayNowPayment";

function PayNativeCustomScreen({ route }) {
  const connectedAccountId = route?.params?.connectedAccountId;
  return <PayNowPayment connectedAccountId={connectedAccountId} />;
}

export default PayNativeCustomScreen;
