const { Types } = require("mongoose");
const userServices = require("../services/userServices");
const jwt = require("jsonwebtoken");
const mailer = require("../utils/mailer");

const refreshTokenOptions = {
  httpOnly: true,
  // secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const postVerifyEmail = async (req, res, next) => {
  const {
    name,
    email,
    password,
    country,
    city,
    gender,
    houseNumberOrName,
    postCode,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !country ||
    !city ||
    !gender ||
    !houseNumberOrName ||
    !postCode
  ) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("email", email);

    if (user) {
      return res.status(403).json({ message: "This email is already added!" });
    } else {
      const token = await userServices.verifyEmailToken({ payload: req.body });

      const body = {
        from: process.env.EMAIL_USER,
        to: `${email}`,
        subject: "Verify Your Email",
        html: `<h2>Hello ${email}</h2>
      <p>Verify your email address to complete the signup and login into your <strong>KachaBazar</strong> account.</p>

        <p>This link will expire in <strong> 15 minute</strong>.</p>

        <p style="margin-bottom:20px;">Click this link for active your account</p>

        <a href=${process.env.STORE_URL}/user/email-verification/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>

        <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at hellomehedipro@gmail.com</p>

        <p style="margin-bottom:0px;">Thank you</p>
        <strong>NEXT Team</strong>
             `,
      };

      const message = "Please check your email to verify!";
      mailer.sendEmail(body, res, message);
    }
  } catch (e) {
    return next(e);
  }
};

const postRegisterUser = async (req, res, next) => {
  const token = req.params?.token;

  if (!token) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  const userData = jwt.decode(token);

  try {
    const user = await userServices.findUserByProperty("email", userData.email);

    if (!user && token) {
      jwt.verify(token, process.env.JWT_ACESS, async (err, decodedUser) => {
        if (err) {
          return res
            .status(401)
            .json({ message: "Token expired! please try again." });
        } else {
          const newUser = await userServices.createNewUser({ data: userData });

          const refreshToken = await userServices.signInAuthToken({
            user: userData,
          });

          const accessToken = await userServices.verifyAuthToken({
            user: newUser,
          });

          const { password, ...others } = newUser._doc;

          return res
            .cookie("refreshToken", refreshToken, refreshTokenOptions)
            .status(201)
            .json({
              accessToken,
              user: others,
              message: "Email has been verified!",
            });
        }
      });
    }

    const refreshToken = await userServices.signInAuthToken({ user });

    const accessToken = await userServices.verifyAuthToken({ user });

    const { password, ...others } = user._doc;

    return res
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(200)
      .json({
        accessToken,
        user: others,
        message: "Email is already verified!",
      });
  } catch (e) {
    return next(e);
  }
};

const postSignupGoogleProvider = async (req, res, next) => {
  const { name, email, image } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("email", email);

    if (!user) {
      const newUser = await userServices.createNewUser({
        data: { name, email, image },
      });

      const refreshToken = await userServices.signInAuthToken({
        user: newUser,
      });

      const accessToken = await userServices.verifyAuthToken({ user: newUser });

      const { password, ...others } = newUser._doc;

      return res
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .status(201)
        .json({ accessToken, user: others });
    }

    const refreshToken = await userServices.signInAuthToken({ user });

    const accessToken = await userServices.signInAuthToken({ user });

    const { password, ...others } = user._doc;

    return res
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(200)
      .json({ accessToken, user: others });
  } catch (e) {
    return next(e);
  }
};

const postLoginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const token = req.cookies?.refreshToken;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    if (token) {
      return res.status(400).json({ message: "Already logged in!" });
    }

    const user = await userServices.findUserByProperty("email", email);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const refreshToken = await userServices.signInAuthToken({ user });
    const accessToken = await userServices.verifyAuthToken({ user });
    const { password: pwd, ...others } = user._doc;

    return res
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(200)
      .json({ accessToken, user: others, message: "Login successfull" });
  } catch (e) {
    return next(e);
  }
};

const postLogoutUser = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  try {
    return res
      .clearCookie("refreshToken", {
        httpOnly: true,
        // secure: true,
        sameSite: "none",
      })
      .json({ message: "Logged out successfully" });
  } catch (e) {
    return next(e);
  }
};

const getRefresh = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  try {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH,
      async (err, decodedUser) => {
        if (err) {
          return res.status(401).json({ message: "Unauthorized!" });
        }

        const user = await userServices.findUserByProperty(
          "email",
          decodedUser.email
        );

        if (!user) {
          return res.status(404).json({ message: "User not found!" });
        }

        const accessToken = await userServices.verifyAuthToken({ user });

        const { password, ...others } = user._doc;

        return res.status(200).json({ accessToken, user: others });
      }
    );
  } catch (e) {
    return next(e);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userServices.findUsers();

    if (!users?.length > 0) {
      return res.status(404).json({ message: "No user found!" });
    }

    return res.status(200).json(users);
  } catch (e) {
    return next(e);
  }
};

const getUserById = async (req, res, next) => {
  const _id = req.params?.userId;

  if (!_id || !Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("_id", _id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { password, ...others } = user._doc;

    return res.status(200).json({ user: others });
  } catch (e) {
    return next(e);
  }
};

const deleteUserById = async (req, res, next) => {
  const _id = req.params?.userId;

  if (!_id || !Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("_id", _id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await userServices.removeUserById({ _id });

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    return next(e);
  }
};

const patchUserRoleById = async (req, res, next) => {
  const _id = req.params?.userId;
  const { role } = req.body;

  const roles = ["admin", "user"];

  if (!_id || !Types.ObjectId.isValid(_id) || !roles.includes(role)) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("_id", _id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const updatedUser = await userServices.updateUserRoleById({ _id, role });

    const { password, ...others } = updatedUser._doc;

    return res.status(200).json({ user: others });
  } catch (e) {
    return next(e);
  }
};

const putUserById = async (req, res, next) => {
  const _id = req.params?.userId;

  const { name, email, country, city, gender, houseNumberOrName, postCode } =
    req.body;

  if (
    !_id ||
    !Types.ObjectId.isValid(_id) ||
    !name ||
    !email ||
    !gender ||
    !country ||
    !city ||
    !houseNumberOrName ||
    !postCode ||
    req.body?.password
  ) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("_id", _id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const updatedUser = await userServices.updateUserById({
      _id,
      data: req.body,
    });

    const { password: pwd, ...others } = updatedUser._doc;

    return res.status(200).json({ user: others });
  } catch (e) {
    return next(e);
  }
};

const patchForgetPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    const user = await userServices.findUserByProperty("email", email);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const accessToken = await userServices.verifyToken({ user });

    const body = {
      from: process.env.EMAIL_USER,
      to: `${email}`,
      subject: "Pasword reset",
      html: `<h2>Hello ${email}</h2>
      <p>A request has been received to change the password for your <strong>Next</strong> account</p>

      <p>This link will expire in <strong> 15 minutes</strong></p>

      <p style="margin-bottom: 20px;">Click this link to reset password</p>

      <a href=${process.env.STORE_URL}/user/forget-password/${accessToken} style="background: #22c55e; color: #fff; border: 1px solid #22c55e; padding: 10px 15px; border-radius: 4px">Reset password</a>

      <p style="margin-top: 35px;">If you did not initiate this requesst, please contact us immediately at hellomehedipro@gmail.com</p>

      <p style="margin-bottom: 0px;">Thank you</p>
      <strong>Next Team</strong>
      `,
    };

    const message = "Please check your email to reset password!";
    mailer.sendEmail(body, res, message);
  } catch (e) {
    return next(e);
  }
};

const patchResetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    jwt.verify(token, process.env.JWT_ACESS, async (err, decodedUser) => {
      if (err) {
        return res.status(401).json({ message: "Invalid! please try again." });
      }

      const { email } = jwt.decode(token);

      const user = await userServices.findUserByProperty("email", email);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      const updatedUser = await userServices.resetPassword({
        user,
        newPassword,
      });

      const refreshToken = await userServices.signInAuthToken({ user });

      const accessToken = await userServices.verifyAuthToken({ user });

      const { password: pwd, ...others } = updatedUser._doc;

      return res
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .status(200)
        .json({
          accessToken,
          user: others,
          message: "Password has been reset successfully.",
        });
    });
  } catch (e) {
    return next(e);
  }
};

const patchChangePassword = async (req, res, next) => {
  const { email, password, newPassword } = req.body;

  if (!email || !password || !newPassword) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  try {
    let user = await userServices.findUserByProperty("email", email);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    user = await userServices.updatePassword({ user, password, newPassword });

    const { password: userPassword, ...others } = user._doc;
    return res.status(200).json({
      user: others,
      message: "Password has been changed successfully",
    });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  postVerifyEmail,
  postRegisterUser,
  postSignupGoogleProvider,
  postLoginUser,
  postLogoutUser,
  getRefresh,
  getUsers,
  getUserById,
  deleteUserById,
  patchUserRoleById,
  putUserById,
  patchForgetPassword,
  patchResetPassword,
  patchChangePassword,
};
