const express = require("express");
const router = express.Router();

router.get("/account-created", (req, res) => {
  const { localReturnUrl } = req.query;
  console.log(localReturnUrl);

  res.send(`
  <html>
  <head>
    <style>
      body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center
      }
      .button {
        text-align: center;
        font-size: 42px;
      }
  </style>
    <script>
      function redirectToApp() {
        window.location.replace("${localReturnUrl}");
      }
    </script>
  </head>
  <body onLoad="redirectToApp()">
      <h1>Your account was created!</h1>
      <button class="button" onclick="redirectToApp()">Close</button>
  </body>
</html>  
  `);
});

module.exports = router;
