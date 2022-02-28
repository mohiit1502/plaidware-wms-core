const mongoose = require("mongoose");
const { CustomAttributeTypes } = require("./../config/constants");

const schema = new mongoose.Schema(
  {
    commonName: {
      type: String,
      required: true,
      trim: true,
    },
    formalName: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    widgetFamily: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WidgetFamily",
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    unitOfMaterial: {
      type: String,
      required: true,
      trim: true,
    },
    unitCost: {
      type: Number,
      required: true,
    },
    packageCount: {
      type: Number,
      required: true,
    },
    countPerPallet: {
      type: Number,
      required: true,
    },
    countPerPalletPackage: {
      type: Number,
      required: true,
    },
    customAttributes: [
      {
        fieldName: {
          type: String,
          required: true,
          trim: true,
        },
        fieldType: {
          type: String,
          required: true,
          trim: true,
          enum: CustomAttributeTypes,
        },
        fieldValue: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
    policiesMetadata: {
      underStockLevelCount: {
        type: Number,
      },
      overStockLevelCount: {
        type: Number,
      },
      alertStockLevelCount: {
        type: Number,
      },
      reorderStockLevelCount: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", schema);

module.exports = Item;
