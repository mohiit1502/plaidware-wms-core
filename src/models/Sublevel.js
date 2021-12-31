const mongoose = require("mongoose");
const { SubLevelTypes, LevelPositions, SublevelInventoryTypes } = require("../config/constants");

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
      enum: SubLevelTypes,
    },
    specs: {
      type: Object,
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
    hasInventory: {
      type: Boolean,
      default: false,
    },
    preferred_inventory: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "type",
        },
        type: {
          type: String,
          enum: SublevelInventoryTypes,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Sublevel = mongoose.model("Sublevel", schema);

module.exports = Sublevel;

