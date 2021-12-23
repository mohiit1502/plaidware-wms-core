const mongoose = require("mongoose");
const { UserActions, WarehouseScopes } = require("./../config/constants");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    warehouseScope: {
      on: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
      },
      onModel: {
        type: String,
        required: true,
        enum: WarehouseScopes,
      },
    },
    actions: {
      type: String,
      required: true,
      enum: UserActions,
    },
  },
  {
    timestamps: true,
  }
);

const UserPermission = mongoose.model("UserPermission", schema);

module.exports = UserPermission;
