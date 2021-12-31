const mongoose = require("mongoose");
const { SubLevelTypes, LevelPositions } = require("../config/constants");

const schema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
      trim: true,
    },
    number: {
      required: true,
      type: Number,
      trim: true,
    },
    specs: {
      type: Object,
      trim: true,
    },
    bay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
    },
    sub_levels: [
      {
        type: {
          required: true,
          type: String,
          enum: SubLevelTypes,
        },
        positions: [
          {
            type: String,
            enum: LevelPositions,
          },
        ],
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
