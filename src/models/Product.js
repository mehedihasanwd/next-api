const { Schema, model, Types } = require("mongoose");

const productSchema = new Schema(
  {
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

    discount: {
      type: Number,
      required: true,
    },

    discountedPrice: {
      type: Number,
      required: false,
    },

    sales: {
      type: Number,
      required: false,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
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

    averageRating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: [
        {
          order: {
            type: String,
          },

          user: {
            type: String,
          },

          name: {
            type: String,
          },

          image: {
            type: String,
          },

          uid: {
            type: String,
            default: "uid",
          },

          review: {
            type: String,
          },

          rating: {
            type: Number,
          },

          reviewdAt: {
            type: Date,
          },
        },
      ],
      default: [
        {
          uid: "uid",
          rating: 0,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", productSchema);

module.exports = { Product };

/* 

reviews: {
      type: [
        {
          order: {
            type: String,
            default: "",
          },

          user: {
            type: String,
            default: "",
          },

          name: {
            type: String,
            default: "",
          },

          image: {
            type: String,
            default: "",
          },

          uid: {
            type: String,
            default: "",
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
      default: 0,
    },
*/
