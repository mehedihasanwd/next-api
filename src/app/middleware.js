const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const middleware = [
  express.json(),
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
  morgan("dev"),
  cookieParser(),
];

module.exports = middleware;
