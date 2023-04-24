const { Types } = require("mongoose");
const { Order } = require("../models/Order");
const { error } = require("../utils/error");
const productServices = require("./productServices");
const Stripe = require("stripe");

/* Utils function starts */
const findOrderByProperty = (key, value) => {
  if (key === "_id") {
    return Order.findById(value);
  } else if (key === "user") {
    return Order.find({ user: value });
  }
  return Order.findOne({ [key]: value });
};

const updateOrderHelper = async ({ _id, data }) => {
  let isObject;

  if (typeof data === "object") {
    isObject = true;
  } else if (typeof data === "string") {
    isObject = false;
  } else {
    throw error("Invalid credentials!", 400);
  }

  const order = await Order.findByIdAndUpdate(
    _id,
    {
      $set: isObject ? data : { status: data },
    },
    { new: true }
  );

  return order.save();
};

const generateId = () => {
  return new Types.ObjectId();
};

/* Utils function ends */

const createNewOrder = async ({ data, user }) => {
  const { amount, products, ...others } = data;

  const stripe = new Stripe(process.env.STRIPE);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    payment_method_types: ["card"],
  });

  const order = new Order({
    ...others,
    user: user,
    products: products.map((product) => ({
      ...product,
      uid: generateId(),
    })),
    payment_intent: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  });

  order.save();

  data?.products?.forEach(
    async (item) =>
      await productServices.updateProductStockAndSalesById({
        _id: item.product,
      })
  );

  return order;
};

const findOrders = async () => {
  return await Order.find();
};

const updateOrderStatusById = async ({ _id, status }) => {
  return updateOrderHelper({ _id, data: status });
};

const removeOrderById = async ({ _id }) => {
  return await Order.findByIdAndRemove({ _id });
};

module.exports = {
  findOrderByProperty,
  createNewOrder,
  findOrders,
  updateOrderStatusById,
  removeOrderById,
};
