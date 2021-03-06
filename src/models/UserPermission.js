const mongoose = require("mongoose");
const { UserActions, WarehouseScopes, InventoryScopes, AllUIModules } = require("./../config/constants");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    inventoryScopes: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "type",
        },
        type: {
          type: String,
          enum: InventoryScopes,
        },
      },
    ],
    warehouseScopes: [
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
    allowedUIModules: [
      {
        type: String,
        enum: AllUIModules,
      },
    ],
    actions: [
      {
        type: String,
        required: true,
        enum: UserActions,
      },
    ],
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserPermission = mongoose.model("UserPermission", schema);

module.exports = UserPermission;
