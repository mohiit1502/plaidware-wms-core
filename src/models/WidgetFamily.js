const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WidgetFamily",
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const WidgetFamily = mongoose.model("WidgetFamily", schema);

module.exports = WidgetFamily;
