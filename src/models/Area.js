const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
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
    rows: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Row",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Area = mongoose.model("Area", schema);

module.exports = Area;
