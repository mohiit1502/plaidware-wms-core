const AWS = require("aws-sdk");
const fs = require("fs");
const { AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_S3_REGION } = require("./env");

AWS.config.update({
  maxRetries: 3,
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  region: AWS_S3_REGION,
});

const S3 = new AWS.S3();

module.exports = {
  S3: {
    uploadFile: async (key, filepath) => {
      const fileReadStream = fs.createReadStream(filepath);
      const params = {
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Body: fileReadStream,
      };

      try {
        const response = await S3.upload(params).promise();
        console.log("S3 Upload success", response);
        fs.rmSync(filepath);
        return response.Location;
      } catch (error) {
        console.log("S3 Upload Error", error);
        fs.rmSync(filepath);
        return false;
      }
    },
    generatePresignedUrl: (url) => {
      const key = url.split(".com/")[1];
      return S3.getSignedUrl("getObject", {
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Expires: 600,
      });
    }
  },
};
