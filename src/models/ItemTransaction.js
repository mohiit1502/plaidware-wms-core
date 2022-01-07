const mongoose = require("mongoose");
const { ItemTransactionTypes } = require("../config/constants");

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ItemTransactionTypes,
    },
    performedOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    discriminatorKey: "kind",
  }
);

const ItemTransaction = mongoose.model("ItemTransaction", schema);

const PutItemTransaction = ItemTransaction.discriminator(
  "Put",
  new mongoose.Schema({
    putQuantity: {
      type: Number,
      required: true,
    },
    subLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sublevel"
    },
  })
);

const PickItemTransaction = ItemTransaction.discriminator(
  "Pick",
  new mongoose.Schema({
    pickupQuantity: {
      type: Number,
      required: true,
    },
    subLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sublevel",
    },
  })
);

const ReserveItemTransaction = ItemTransaction.discriminator(
  "Reserve",
  new mongoose.Schema({
    reserveQuantity: {
      type: Number,
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
  })
);

const CheckInItemTransaction = ItemTransaction.discriminator(
  "CheckIn",
  new mongoose.Schema({
    checkInMeterReading: {
      type: Number,
      required: true,
    },
    hasIssue: {
      type: Boolean,
      required: true,
    },
    issueDescription: {
      type: String,
      trim: true,
    },
  })
);

const CheckOutItemTransaction = ItemTransaction.discriminator(
  "CheckOut",
  new mongoose.Schema({
    checkOutMeterReading: {
      type: Number,
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    usageReason: {
      type: String,
      trim: true,
    },
  })
);

const ReportItemTransaction = ItemTransaction.discriminator(
  "Report",
  new mongoose.Schema({
    for: {
      type: String,
      required: true,
      enum: ["LOCATION", "ISSUE", "INCIDENT"]
    },
    details: {
      type: String,
      trim: true,
    },
  })
);

const AdjustItemTransaction = ItemTransaction.discriminator(
  "Adjust",
  new mongoose.Schema({
    lastRecordedQuantity: {
      type: Number,
      required: true,
    },
    recountedQuantity: {
      type: Number,
      required: true,
    },
    varianceRecordedInQuantity: {
      type: Number,
      required: true,
    },
    damagedQuantity: {
      type: Number,
      required: true,
    },
    totalAdjustment: {
      type: Number,
      required: true,
    },
    newAdjustedQuantity: {
      type: Number,
      required: true,
    },
  })
);

module.exports = {
  ItemTransaction,
  PutItemTransaction,
  PickItemTransaction,
  ReserveItemTransaction,
  CheckInItemTransaction,
  CheckOutItemTransaction,
  ReportItemTransaction,
  AdjustItemTransaction,
};
