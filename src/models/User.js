const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { UserActions, WarehouseScopes, InventoryScopes, AllUIModules } = require("./../config/constants");

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
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserRole",
      },
    ],
    permissions: {
      inventoryScopes: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "type",
          },
          type: {
            type: String,
            enum: InventoryScopes,
          },
        },
      ],
      warehouseScopes: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "type",
          },
          type: {
            type: String,
            enum: WarehouseScopes,
          },
        },
      ],
      allowedUIModules: [
        {
          type: String,
          enum: AllUIModules,
        },
      ],
      actions: [
        {
          type: String,
          required: true,
          enum: UserActions,
        },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

schema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const User = mongoose.model("User", schema);

module.exports = User;
