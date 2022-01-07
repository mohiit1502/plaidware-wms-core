const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    sub_level_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sublevel",
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ item_id: 1, sub_level_id: 1 }, { unique: 1 });

const ItemAssociation = mongoose.model("ItemAssociation", schema);

module.exports = ItemAssociation;
