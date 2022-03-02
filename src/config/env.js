require("dotenv").config();

const envVariables = {
  API_PORT: process.env.API_PORT || "3000",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
  JWT_SECRET: process.env.JWT_SECRET || "secret123",
  JWT_REFRESH_EXPIRY_TIME: parseInt(process.env.JWT_REFRESH_EXPIRY_TIME) || 3600,
  JWT_ACCESS_EXPIRY_TIME: parseInt(process.env.JWT_ACCESS_EXPIRY_TIME) || 86400,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_REGION: process.env.AWS_S3_REGION || "us-east-2",
};

module.exports = envVariables;
