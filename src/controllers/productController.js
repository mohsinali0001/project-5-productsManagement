const productModel = require("../models/productModel");
const mongoose = require("mongoose");
let s3 = require("../s3/aws");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "Number" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

let isValidateSize = function (value) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value) != -1;
};

const createProduct = async (req, res) => {
  try {
    //Checking if no data is present in our request body
    let data = req.body;
    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter details of product" });
    }

    //Checking if user has entered these mandatory fields or not
    const {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      productImage,
      availableSizes,
      style,
      installments,
    } = data;

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "title is required" });
    }
    let uniqueTitle = await productModel.findOne({ title: title });
    if (uniqueTitle) {
      return res
        .status(400)
        .send({ status: false, message: "Title already exists" });
    }

    if (!isValid(description)) {
      return res
        .status(400)
        .send({ status: false, message: "description is required" });
    }

    if (!isValid(price)) {
      return res
        .status(400)
        .send({ status: false, message: "price is required" });
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid price" });
    }

    if (!isValid(currencyId)) {
      return res
        .status(400)
        .send({ status: false, message: "currencyId is required" });
    }

    if (!isValid(currencyFormat)) {
      return res
        .status(400)
        .send({ status: false, message: "currencyFormat is required" });
    }

    let files = req.files;
    if (files && files.length > 0) {
      let uploadedFileURL = await s3.uploadFile(files[0]);
      data["productImage"] = uploadedFileURL;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "productImage is required" });
    }

    if (!isValidateSize(availableSizes)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Availablesize atleast one of the size in S, XS, M, X, L, XXL, XL",
        });
    }

    let productData = {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      productImage: data.productImage,
      style,
      availableSizes,
      installments,
    };

    let productDetails = await productModel.create(productData);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: productDetails });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

let getProductsByfilter = async function (req, res) {
  try {
    let productData = await productModel.find({ isDeleted: false });
    if (productData) {
      return res
        .status(200)
        .send({
          status: false,
          message: "Product Details are not deleted",
          data: productData,
        });
    }
    let data = req.query;
    const { size, name, price } = data;
    filteredQuery = { isdeleted: false };

    if (isValid(size)) {
      filteredQuery["availableSizes"] = size;
    }

    if (isValid(name)) {
      filteredQuery["title"] = name;
    }

    const products = await productModel.find(filteredQuery);

    if (Array.isArray(products) && products.length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "No data Available" });
    }
    res
      .status(200)
      .send({ status: true, message: "products list", data: products });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

let getProductsById = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "productId required" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "productId not a valid ObjectId" });
    }

    let productData = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!productData) {
      return res
        .status(404)
        .send({
          status: false,
          message:
            "product not present in the collection or it is already Deleted",
        });
    }

    return res
      .status(200)
      .send({ status: true, message: "Product details", data: productData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updatedProducts = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "userid required" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId not a valid ObjectId" });
    }

    let productData = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!productData) {
      return res
        .status(404)
        .send({
          status: false,
          message: "product not present in the collection",
        });
    }

    let data = req.body;
    const {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      productImage,
      availableSizes,
      style,
      installments,
    } = data;

    let updatedData = {};
    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter value to be updating..." });
    }

    if (title) {
      if (!isValid(title)) {
        return res
          .status(400)
          .send({ status: false, msg: "title is required" });
      }
      let uniqueTitle = await productModel.findOne({ title: title });
      if (uniqueTitle) {
        return res
          .status(400)
          .send({ status: false, message: "Title already exists" });
      }
      updatedData["title"] = title;
    }

    if (description) {
      if (!isValid(description)) {
        return res
          .status(400)
          .send({ status: false, msg: "description required" });
      }
      updatedData["description"] = description;
    }

    if (price) {
      if (!isValid(price)) {
        return res
          .status(400)
          .send({ status: false, msg: "price is not in valid format" });
      }
      if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid price" });
      }

      updatedData["price"] = price;
    }

    if (description) {
      if (!isValid(description)) {
        return res
          .status(400)
          .send({ status: false, msg: "description required" });
      }
      updatedData["description"] = description;
    }
    let files = req.files;
    if (files && files.length > 0) {
      let uploadedFileURL = await s3.uploadFile(files[0]);
      data["productImage"] = uploadedFileURL;
    }
    updatedData["productImage"] = data.productImage;

    if (currencyId) {
      if (!isValid(currencyId)) {
        return res
          .status(400)
          .send({ status: false, msg: "currencyId is not in valid format" });
      }
      updatedData["currencyId"] = currencyId;
    }

    if (availableSizes) {
      if (!isValid(availableSizes)) {
        return res
          .status(400)
          .send({ status: false, msg: "availableSizes is required" });
      }
      if (!isValidateSize(availableSizes)) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Availablesize atleast one of the size in S, XS, M, X, L, XXL, XL",
          });
      }
      updatedData["availableSizes"] = availableSizes;
    }

    if (isValid(style)) {
      updatedData["style"] = style;
    }

    if (isValid(installments)) {
      updatedData["installments"] = installments;
    }

    let updatedDetails = await productModel.findByIdAndUpdate(
      productId,
      { $set: updatedData },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "product updated", data: updatedDetails });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

let deleteProducts = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "productId required" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "productId not a valid ObjectId" });
    }

    let productData = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!productData) {
      return res
        .status(404)
        .send({
          status: false,
          message:
            "product not present in the collection or it is already Deleted",
        });
    }

    let deletedProductDetails = await productModel.findByIdAndUpdate(
      productId,
      { $set: { isDeleted: true, deletedAt: Date() } },
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "product deleted successfully",
        data: deletedProductDetails,
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getProductsByfilter,
  getProductsById,
  updatedProducts,
  deleteProducts,
};