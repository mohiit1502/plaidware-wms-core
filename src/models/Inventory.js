const mongoose = require("mongoose");
const { InventoryTypes, WarehouseScopes } = require("./../config/constants");

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
      orderTracking: {
        type: Object, // Create a different model and reference it here once more details available
      },
      alerting: {
        lowestStockLevel: {
          type: Boolean,
          required: true,
        },
        highestStockLevel: {
          type: Boolean,
          required: true,
        },
        alertStockLevel: {
          type: Boolean,
          required: true,
        },
        reOrderLevel: {
          type: Boolean,
          required: true,
        },
      },
      replenishment: {
        type: Object, // Create a different model and reference it here once more details available
      },
      preferredLocations: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "type",
          },
          type: {
            type: String,
            enum: WarehouseScopes,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model("Inventory", schema);

module.exports = Inventory;
