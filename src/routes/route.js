const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController.js");
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const middleware = require('../middleware/auth')



//User
router.post("/register", userController.createUser);   //CreateUser

router.post("/login", userController.loginUser);   //LoginUser

router.get("/user/:userId/profile", middleware.authenticateUser, userController.getProfile);      //getProfile

router.put("/user/:userId/profile", middleware.authenticateUser, userController.updateProfile);    //updateProfile

//-------------------------------------------------------------------------------------------------------------------------

//Product
router.post("/products", productController.createProduct);

router.get("/products", productController.getProductsByfilter);

router.get("/products/:productId", productController.getProductsById);

router.put("/products/:productId", productController.updatedProducts);

router.delete("/products/:productId", productController.deleteProducts);

//-------------------------------------------------------------------------------------------------------------------

//Cart

router.post("/users/:userId/cart", middleware.authenticateUser, cartController.createCart);

router.put("/users/:userId/cart", middleware.authenticateUser, cartController.updatedCart);

router.get("/users/:userId/cart", middleware.authenticateUser, cartController.getCart);

router.delete("/users/:userId/cart", middleware.authenticateUser, cartController.deleteCart);

//-------------------------------------------------------------------------------------------------------------------


//Order

router.post("/users/:userId/orders", middleware.authenticateUser, orderController.createOrder);

router.put("/users/:userId/orders", middleware.authenticateUser, orderController.updateOrder);

module.exports = router;