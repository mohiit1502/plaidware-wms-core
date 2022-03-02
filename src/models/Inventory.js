const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon_slug: {
      type: String,
      trim: true,
      required: true,
      // enum: []
    },
    widgetName: {
      type: String,
      required: true,
      trim: true,
    },
    policies: {
      orderTracking: {
        type: Object, // Create a different model and reference it here once more details available
      },
      alerting: {
        type: Boolean,
        required: true,
      },
      replenishment: {
        type: Boolean, // Create a different model and reference it here once more details available
      },
      inventory_process: {
        type: String,
        required: true,
      },
      // preferredLocations: [
      //   {
      //     id: {
      //       type: mongoose.Schema.Types.ObjectId,
      //       refPath: "type",
      //     },
      //     type: {
      //       type: String,
      //       enum: WarehouseScopes,
      //     },
      //   },
      // ],
      preferredLocations: {
        type: Object, // Create a different model and reference it here once more details available
      },
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model("Inventory", schema);

module.exports = Inventory;
