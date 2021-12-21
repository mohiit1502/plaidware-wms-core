const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
      trim: true,
    },
    number: {
      required: true,
      type: String,
      trim: true,
    },
    specs: {
      // TODO: TBD
      type: String,
      trim: true,
    },
    sub_levels: [
      {
        type: {
          required: true,
          type: String,
          enum: ["POSITION", "BIN", "PALLET"], // TODO: Add to constant file
        },
        depth: {
          required: true,
          type: Number,
          min: 1, // Level is at 0
          max: 5,
        },
        bay_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bay",
        },
        sub_level_id: {
          required: true,
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sublevel",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Level = mongoose.model("Level", schema);

module.exports = Level;
