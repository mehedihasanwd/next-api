const { Schema, model, Types } = require("mongoose");

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },

    products: [
      {
        product: {
          type: Types.ObjectId,
          required: true,
          ref: "Product",
        },

        uid: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        slug: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
        },

        colors: {
          type: [String],
          required: true,
        },

        sizes: {
          type: [String],
          required: true,
        },

        brand: {
          type: String,
          required: true,
        },

        category: {
          type: String,
          required: true,
          enum: [
            "men",
            "women",
            "boy",
            "girl",
            "baby",
            "furniture",
            "sport",
            "accessories",
          ],
        },

        productType: {
          type: String,
          required: true,
        },

        gender: {
          type: String,
          required: true,
          enum: ["man", "woman"],
        },

        review: {
          type: String,
          default: "",
        },

        rating: {
          type: Number,
          default: 0,
        },
      },
    ],

    address: {
      country: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      houseNumberOrName: {
        type: String,
        required: true,
      },

      postCode: {
        type: Number,
        required: true,
      },

      phone: {
        type: String,
        required: false,
      },
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed"],
      default: "pending",
    },

    payment_intent: {
      type: String,
      required: true,
    },

    clientSecret: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

module.exports = { Order };
