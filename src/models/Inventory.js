const mongoose = require("mongoose");
const { InventoryTypes } = require("./../config/constants");

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
      enum: InventoryTypes,
    },
    policies: {
      tracking: {
        type: Object, // Create a different model and reference it here once more details available
        required: true,
      },
      alerting: {
        type: Object, // Create a different model and reference it here once more details available
        required: true,
      },
      replenishment: {
        type: Object, // Create a different model and reference it here once more details available
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model("Inventory", schema);

module.exports = Inventory;
