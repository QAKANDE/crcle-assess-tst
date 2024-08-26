const express = require("express");
const server = express();
const walletRouter = require("./Routes/wallet.route");
const port = process.env.PORT || 3000;

server.use(express.json());

server.use("/wallet", walletRouter);

server.listen(port, () => {
  console.log("Running on port", port);
});
