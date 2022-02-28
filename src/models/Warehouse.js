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
    images: [WarehouseImage],
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
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.model("Warehouse", schema);

module.exports = Warehouse;
