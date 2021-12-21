const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    family: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        depth: {
          type: Number,
          required: true,
          min: 1,
          max: 10
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Material = mongoose.model("Material", schema);

module.exports = Material;
