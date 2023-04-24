require("dotenv").config();
const { connectDatabase } = require("./db");
const port = process.env.PORT || 8000;
const http = require("http");

const server = new http.createServer(require("./app"));

connectDatabase(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 1500,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Database connected!");
    server.listen(port, () =>
      console.log(`Server is listening on port: ${port}`)
    );
  })
  .catch((e) => {
    console.log(e);
  });
