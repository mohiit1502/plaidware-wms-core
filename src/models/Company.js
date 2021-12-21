const mongoose = require("mongoose");

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
    contact_info: {
      type: String,
      trim: true,
    },
    business_info: {
      type: String,
      trim: true,
    },
    warehouses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", schema);

module.exports = Company;
