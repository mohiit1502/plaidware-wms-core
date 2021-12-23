const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserPermission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserRole = mongoose.model("UserRole", schema);

module.exports = UserRole;
