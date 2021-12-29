const mongoose = require("mongoose");
const { SubLevelTypes } = require("../config/constants");

const schema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: SubLevelTypes
    },
    specs: {
      // TBD
      type: String,
      trim: true,
    },
    main_level_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
    },
    current_depth: {
      required: true,
      type: Number,
    },
    parent_sublevel_id: {
      // Not required if depth is 1
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sublevel",
    },
    sub_levels: [
      {
        type: {
          required: true,
          type: String,
          enum: SubLevelTypes,
        },
        depth: {
          required: true,
          type: Number,
          min: 1, // Level is at 0
          max: 5,
        },
        sub_level_id: {
          required: true,
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sublevel",
        },
      },
    ],
    hasInventory: {
      type: Boolean,
      default: false,
    },
    inventory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Sublevel = mongoose.model("Sublevel", schema);

module.exports = Sublevel;

