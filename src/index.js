const express = require("express");

const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const mongoose = require("mongoose");
const { router } = require("./controller");
const {
  API_PORT,
  MONGODB_URI,
} = require("./config/env");

(async () => {
  console.log("Connecting to MongoDB ...");
  await mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB at: ", MONGODB_URI);
    })
    .catch(console.error);

  mongoose.set("debug", true);

  const app = express();

  // config
  app.use(morgan("dev"));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use(router);

  app.listen(API_PORT, () => {
    console.log(`Server started on port ${API_PORT}`);
    console.log(`http://localhost:${API_PORT}/`);
  });
})();
