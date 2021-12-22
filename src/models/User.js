const mongoose = require("mongoose");
const { isEmail } = require("validator");
const { UserActions, WarehouseScopes } = require("./../config/constants");

const schema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Minimum password length is 6 characters"],
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordOTP: {
      type: Number,
      min: 1000,
      max: 9999,
    },
    forgotPasswordOTPRetries: {
      type: Number,
      min: 0,
      max: 3,
    },
    passwordResetToken: {
      type: String,
    },
    authPolicies: [
      {
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
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", schema);

module.exports = User;
