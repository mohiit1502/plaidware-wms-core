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
    areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Zone = mongoose.model("Zone", schema);

module.exports = Zone;
