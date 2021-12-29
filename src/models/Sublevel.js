const mongoose = require("mongoose");
const { SubLevelTypes, LevelPositions } = require("../config/constants");

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
        postitions: [
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
    preffered_inventory: [
      // {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Inventory",
      // },
    ],
  },
  {
    timestamps: true,
  }
);

schema.pre("save", function (next) {
  // const sublevel = this;
  // // write validation here?
  next();
});

const SubLevel = mongoose.model("SubLevel", schema);

module.exports = SubLevel;
