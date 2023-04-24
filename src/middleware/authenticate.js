const jwt = require("jsonwebtoken");
const { error } = require("../utils/error");

const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization;

  if (!token) {
    throw error("Unauthorized!", 401);
  }

  try {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.JWT_ACCESS, async (err, decoded) => {
      if (err) {
        throw error("Unathorized!", 401);
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (e) {
    throw error("Invalid token!", 400);
  }
};

const verifyTokenAndAuthorization = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.params.userId === req.user._id || req.user.role === "admin") {
      next();
    } else {
      throw error("Unauthorized!", 401);
    }
  });
};

const verifyTokenAndAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      throw error("Unauthorized!", 401);
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
};
