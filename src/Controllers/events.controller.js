const Mixpanel = require("mixpanel");
const users = require("../Data/users.json");
const products = require("../Data/products.json");
const cart = require("../Data/cart.json");

const initializeMixPanel = Mixpanel.init(process.env.PROJECT_TOKEN);
const epochTime = Math.floor(Date.now() / 1000);

const addToCart = async (req, res) => {
  const { userid, deviceId, productId } = req.body;

  const findUser = users.filter((user) => user.user_id === userid);
  if (findUser.length === 0) {
    res.json({
      success: false,
      message: "Cannot find user",
    });
  } else {
    const findProduct = products.filter(
      (product) => product.product_id === productId
    );
    if (findProduct.length === 0) {
      res.json({
        success: false,
        message: "Product Not Found",
      });
    } else {
      initializeMixPanel.track("add_to_cart", {
        distinct_id: userid,
        candidate: "Quadri Akande",
        $device_id: deviceId,
        product: {
          productName: findProduct[0].product_name,
          product: findProduct[0].product_id,
          price: findProduct[0].price,
          currency: findProduct[0].currency,
          category: findProduct[0].category,
          price: 25.0,
          available_stock: findProduct[0].available_stock,
          description: findProduct[0].description,
          rating: findProduct[0].rating,
          quantity: 1,
        },
        time: epochTime,
      });

      res.json({
        success: true,
        message: "Add To Cart Event registered",
      });
    }
  }
};

const viewHomePage = async (req, res) => {
  try {
    const { userid, deviceId } = req.body;
    const epochTime = 1680492800;
    const findUser = users.filter((user) => user.user_id === userid);
    if (findUser.length === 0) {
      res.json({
        success: false,
        message: "Cannot find user",
      });
    }

    initializeMixPanel.people.set(userid, {
      name: findUser.name,
      roles: ["customer"],
    });
    initializeMixPanel.track("view_homepage", {
      distinct_id: userid,
      candidate: "Quadri Akande",
      $device_id: deviceId,
      time: epochTime,
    });
    res.json({
      success: true,
      message: "View Homepage Event registered",
    });
  } catch (error) {
    console.log(error);
  }
};

const purchaseComplete = async (req, res) => {
  const { userid, deviceId } = req.body;
  const findUser = users.filter((user) => user.user_id === userid);
  if (findUser.length === 0) {
    res.json({
      success: false,
      message: "Cannot find user",
    });
  } else {
    initializeMixPanel.track("purchase_complete", {
      candidate: "Quadri Akande",
      distinct_id: cart.cart_id,
      $user_id: cart.user_id,
      $device_id: deviceId,
      product: cart.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price,
        currency: item.currency,
        description: item.description,
        rating: item.rating,
      })),
      cart_total: cart.cart_total,
      currency: cart.currency,
    });
    res.json({
      success: true,
      message: "Product Purchase Event registered",
    });
  }
};

module.exports = { addToCart, viewHomePage, purchaseComplete };
