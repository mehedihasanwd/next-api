require("dotenv").config();
const { error } = require("../utils/error");
const { User } = require("../models/User");
const jwt = require("jsonwebtoken");

// Utils function starts
const findUserByProperty = (key, value) => {
  if (key === "_id") {
    return User.findById(value);
  }
  return User.findOne({ [key]: value });
};

const isMatchPassword = async ({ user, password }) => {
  return await user.comparePassword({ password });
};

const makePayload = ({ user }) => {
  const { _id, name, email, role } = user._doc;
  return {
    _id,
    name,
    email,
    role,
  };
};

const createToken = async ({ user, payload, secretKey, expiresIn }) => {
  return await user.generateRefreshOrAccessToken({
    payload,
    secretKey,
    expiresIn,
  });
};

// Utils function ends

const createNewUser = ({ data }) => {
  const user = new User({ ...data });
  return user.save();
};

const findUsers = async () => {
  return await User.find().select("-password");
};

const updateUserById = async ({ _id, data }) => {
  const user = await User.findByIdAndUpdate(
    _id,
    {
      $set: data,
    },
    { new: true }
  );

  return user.save();
};

const signInAuthToken = async ({ user }) => {
  const payload = makePayload({ user });
  return await createToken({
    user,
    payload,
    secretKey: process.env.JWT_REFRESH,
    expiresIn: "7d",
  });
};

const verifyAuthToken = async ({ user }) => {
  const payload = makePayload({ user });
  return await createToken({
    user,
    payload,
    secretKey: process.env.JWT_ACCESS,
    expiresIn: "2h",
  });
};

const verifyEmailToken = ({ payload }) => {
  return jwt.sign(payload, process.env.JWT_ACCESS, { expiresIn: "15m" });
};

const resetPassword = async ({ user, newPassword }) => {
  user.password = newPassword;
  return user.save();
};

const updatePassword = async ({ user, password, newPassword }) => {
  const isMatch = await isMatchPassword({ user, password });

  if (!isMatch) {
    throw error("Invalid credentials!", 400);
  }
  user.password = newPassword;
  return user.save();
};

const removeUserById = async ({ _id }) => {
  return await User.findByIdAndRemove(_id);
};

const updateUserRoleById = async ({ _id, role }) => {
  const user = await User.findByIdAndUpdate(
    _id,
    {
      $set: { role },
    },
    { new: true }
  );
  return user.save();
};

module.exports = {
  findUserByProperty,
  createNewUser,
  findUsers,
  updateUserById,
  signInAuthToken,
  verifyAuthToken,
  verifyEmailToken,
  resetPassword,
  updatePassword,
  removeUserById,
  updateUserRoleById,
  isMatchPassword,
};
