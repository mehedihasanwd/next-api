const { connect, set } = require("mongoose");

set("strictQuery", false);

const connectDatabase = (connectionStr, options) => {
  return connect(connectionStr, options);
};

module.exports = { connectDatabase };
