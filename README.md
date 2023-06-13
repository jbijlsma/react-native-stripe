# Example of using the Stripe Payments API in a React Native Expo app

<p float="left" align="middle">
<img src="./screenshots/stripe_dark.gif" width="40%">
<img src="./screenshots/stripe_light.gif" width="40%">
</p>

# Running locally

Stripe requires that you create your own backend server (API) to create Payment Intentions. In this example the custom backend server (API) is implemented in NodeJs.

To run this demo, you must first sign up with Stripe and get your Publishable key and Secret key.

## Run the server

Copy the .env.example file:

```bash
cp ./server/.env.example ./server/.env
```

Update the .env file:

```
STRIPE_SECRET_KEY={your Secret key}
```

Start the server:

```bash
npm run dev
```

## Run the client

Copy the .env_local.example file:

```bash
cp ./client/.env_local.example ./client/.env_local
```

Update the .env_local file:

```
STRIPE_PUBLIC_KEY={your Publishable key}
```

Start the client:

```bash
npm start
```

## Good to know

- If you want to run on your real (iOS) device and want to access the Payment API running on your own machine you can update your shell startup config file (~/.zshrc in my case) and export your machine's network interface ip with:

```bash
export LOCAL_IP=$(ipconfig getifaddr en0)
```

The babel.config.js file already has LOCAL_IP in the allowed list so it is available in the app:

```
allowlist: [ .., "LOCAL_IP"],
```

- Code that looks ok and compiles can easily crash the Expo Go app without any error messages appearing in the console. For example calling Alert.alert(..) with only one argument or calling Alert.alert(.., ..) with 2 arguments, but not passing a string to the arguments.

## Testing the server

To create a payment intent:

```bash
curl -X POST -H "Content-Type: application/json" \
-d "{\"amount\":18950}" http://localhost:3000/payments/intent
```
