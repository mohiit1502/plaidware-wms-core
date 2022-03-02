const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// eslint-disable-next-line require-jsdoc
const BaseSchema = new Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: Date,
    updatedAt: Date
  }
);

module.exports = BaseSchema;
