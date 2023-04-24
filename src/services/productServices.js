const { error } = require("../utils/error");
const { Product } = require("../models/Product");

/* Utils function starts */
const findProductByProperty = (key, value) => {
  if (key === "_id") {
    return Product.findById(value);
  }
  return Product.findOne({ [key]: value });
};

/* Utils function ends */

const createNewProduct = ({ data }) => {
  const product = new Product({ ...data });
  return product.save();
};

const createAllProducts = ({ data }) => {
  return Product.insertMany(
    data.map((product) => {
      let discountedPrice = (product.discount / 100) * product.price;
      discountedPrice = product.price - discountedPrice;
      return {
        ...product,
        discountedPrice,
      };
    })
  );
};

const findProducts = async () => {
  return await Product.find();
};

const findActiveProducts = async () => {
  return await Product.find({ status: "active" }).sort({ _id: -1 });
};

const findStockOutProducts = async () => {
  return await Product.find({ stock: { $lt: 1 } }).sort({ _id: -1 });
};

const findDiscountedProducts = async () => {
  return await Product.find({ discount: { $gt: 5 } }).sort({ _id: -1 });
};

const updateProductById = async ({ _id, data }) => {
  const product = await Product.findByIdAndUpdate(
    _id,
    {
      $set: data,
    },
    { new: true }
  );
  return product.save();
};

const updateProductStockOrStatusById = async ({ _id, data }) => {
  const product = await Product.findByIdAndUpdate(
    _id,
    {
      $set: data,
    },
    { new: true }
  );
  return product.save();
};

const updateProductStockAndSalesById = async ({ _id }) => {
  const product = await Product.findByIdAndUpdate(
    _id,
    {
      $inc: { stock: -1, sales: 1 },
    },
    { new: true }
  );
  return product.save();
};

const updateProductAvgRatingById = async ({ _id, averageRating }) => {
  console.log(averageRating);
  const product = await Product.findByIdAndUpdate(
    _id,
    {
      $set: { averageRating },
    },
    { new: true }
  );
  return product.save();
};

const removeProductById = async ({ _id }) => {
  return await Product.findByIdAndRemove(_id);
};

module.exports = {
  findProductByProperty,
  findProducts,
  findActiveProducts,
  findStockOutProducts,
  findDiscountedProducts,
  createNewProduct,
  createAllProducts,
  updateProductById,
  updateProductStockAndSalesById,
  updateProductStockOrStatusById,
  removeProductById,
  updateProductAvgRatingById,
};
