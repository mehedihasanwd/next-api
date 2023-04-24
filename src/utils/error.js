const error = (message = "Server error occurred!", status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = { error };
