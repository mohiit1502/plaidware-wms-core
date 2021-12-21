require("dotenv").config();

const envVariables = {
  API_PORT: process.env.API_PORT || "3000",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:12017",
};

module.exports = envVariables;
