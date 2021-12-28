const multer = require("multer");

const storage = multer.diskStorage({
  // multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  limits: {
    // files: 1,
    fileSize: 1024 * 1024,
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
  onFileUploadStart: function (file) {
    console.log("Inside uploads");
    if (
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png"
    ) {
      return true;
    } else {
      return false;
    }
  },
});

const upload = multer({
  // multer settings
  storage,
});

// http://expressjs.com/en/resources/middleware/multer.html
module.exports = upload;
