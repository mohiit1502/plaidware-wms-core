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
    quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ItemAssociation = mongoose.model("ItemAssociation", schema);

module.exports = ItemAssociation;
