module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          // If you don't use the direnv shell extension the path to the file that contains the settings (default .env)
          path: ".env_local",
          allowlist: ["STRIPE_PUBLIC_KEY"],
        },
      ],
    ],
  };
};
