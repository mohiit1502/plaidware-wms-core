const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    specs: {
      type: String,
      trim: true,
    },
    row_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Row",
    },
    levels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Level",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Bay = mongoose.model("Bay", schema);

module.exports = Bay;
