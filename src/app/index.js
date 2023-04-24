const app = require("express")();

app.use(require("./middleware"));
app.use(require("../routes"));

app.use((err, req, res, next) => {
  const message = err.message || "Something went wrong!";
  const status = err.status || 500;
  return res.status(status).json(message);
});

module.exports = app;
