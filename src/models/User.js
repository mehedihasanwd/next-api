const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      validator: {
        validate: function (v) {
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          );
        },
        message: ({ value }) => `Invalid email: ${value}`,
      },
    },

    password: {
      type: String,
      required: false,
    },

    gender: {
      type: String,
      required: true,
      enum: ["man", "woman"],
    },

    phone: { type: String, required: false },

    image: {
      type: String,
      required: false,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png",
    },

    role: {
      type: String,
      enum: ["admin", "user", "editor"],
      default: "user",
    },

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
  {
    timestamps: true,
  }
);

userSchema.methods.generateRefreshOrAccessToken = ({
  payload,
  secretKey,
  expiresIn,
}) => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

userSchema.methods.comparePassword = async function ({ password }) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model("User", userSchema);

module.exports = { User };
