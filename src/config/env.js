require("dotenv").config();

const envVariables = {
  API_PORT: process.env.API_PORT || "3000",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:12017",
  JWT_SECRET: process.env.JWT_SECRET || "secret123",
  JWT_REFRESH_EXPIRY_TIME:
    parseInt(process.env.JWT_REFRESH_EXPIRY_TIME) || 3600,
  JWT_ACCESS_EXPIRY_TIME: parseInt(process.env.JWT_ACCESS_EXPIRY_TIME) || 86400,
};

module.exports = envVariables;
