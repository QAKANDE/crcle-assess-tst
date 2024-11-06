const express = require("express");
const {
  addToCart,
  viewHomePage,
  purchaseComplete,
} = require("../Controllers/events.controller");
const router = express.Router();

router.post("/add-to-cart", addToCart);

router.post("/view-homepage", viewHomePage);

router.post("/purchase-complete", purchaseComplete);

module.exports = router;
