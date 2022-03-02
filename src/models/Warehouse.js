const mongoose = require("mongoose");

const WarehouseImage = new mongoose.Schema({
  url: {
    type: String,
    trim: true,
  },
});

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    specs: {
      type: String,
      trim: true,
    },
    image_url: {
      type: String,
      trim: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    zones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
      },
    ],
    preferredInventories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.model("Warehouse", schema);

module.exports = Warehouse;
