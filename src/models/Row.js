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
    specs: {
      type: String,
      trim: true,
    },
    bays: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bay",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Row = mongoose.model("Row", schema);

module.exports = Row;
