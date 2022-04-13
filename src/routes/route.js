const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController.js");
// const productController=require('../controllers/productController')
const middleware = require('../middleware/auth')



//User
router.post("/register", userController.createUser);   //CreateUser
router.post("/login", userController.loginUser);   //LoginUser
router.get("/user/:userId/profile", middleware.authenticateUser, userController.getProfile);      //getProfile
router.put("/user/:userId/profile", middleware.authenticateUser, userController.updateProfile);    //updateProfile


module.exports = router;
