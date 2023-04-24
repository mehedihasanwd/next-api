const router = require("express").Router();
const verifyLimitAndFormat = require("../utils/verifyLimitAndFormat");
const authenticate = require("../middleware/authenticate");
const userControllers = require("../controllers/userControllers");

router.post(
  "/verify-email",
  verifyLimitAndFormat.emailPassVerificationLimit,
  userControllers.postVerifyEmail
);

router.post("/register/:token", userControllers.postRegisterUser);

router.post("/signup", userControllers.postSignupGoogleProvider);

router.post("/login", userControllers.postLoginUser);

router.post("/logout", userControllers.postLogoutUser);

router.get("/refresh", userControllers.getRefresh);

router.patch(
  "/forget-password",
  authenticate.verifyToken,
  userControllers.patchForgetPassword
);

router.patch(
  "/reset-password",
  authenticate.verifyToken,
  userControllers.patchResetPassword
);

router.patch(
  "/change-password",
  authenticate.verifyToken,
  userControllers.patchChangePassword
);

module.exports = router;
