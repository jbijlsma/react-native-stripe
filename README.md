# Example of Stripe from a React Native Expo app

# Running locally

Stripe requires that you create your own backend server (API) to create Payment Intentions. In this example the custom backend server (API) is implemented in NodeJs.

To run this demo, you must first sign up with Stripe and get your Publishable key and Secret key.

## Run the server

Copy the .env.example file:

```bash
cp ./server/.env.example ./server/.env
```

Update the .env file:

```json
STRIPE_PUBLIC_KEY={your Publishable key}
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

```json
STRIPE_SECRET_KEY={your Secret key}
```

Start the client:

```bash
npm start
```

## Testing the server

To create a payment intent:

```bash
curl -X POST -H "Content-Type: application/json" \
-d "{\"amount\":18950}" http://localhost:3000/payments/intent
```
