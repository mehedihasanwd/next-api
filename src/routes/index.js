const router = require("express").Router();

router.get("/api/v1/health", (req, res, next) => {
  return res.status(200).json({ message: "Success." });
});

router.use("/api/v1/auth", require("./authRoutes"));
router.use("/api/v1/users", () => {});
router.use("/api/v1/products", () => {});
router.use("/api/v1/orders", () => {});

module.exports = router;
