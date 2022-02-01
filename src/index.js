const express = require("express");

const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");


const { router } = require("./controller");
const {
  API_PORT,
} = require("./config/env");

const db = require("./config/db/connect");

(async () => {
  await db.connect();

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
