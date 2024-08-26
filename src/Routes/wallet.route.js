const express = require("express");
const {
  generateWalletSet,
  generateWallet,
  transferToken,
} = require("../Controllers/generate.controller");
const router = express.Router();

router.post("/create-wallet", generateWalletSet, generateWallet, transferToken);

module.exports = router;
