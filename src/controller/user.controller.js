const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./../models/User");
const {
  JWT_SECRET,
  JWT_REFRESH_EXPIRY_TIME,
  JWT_ACCESS_EXPIRY_TIME,
} = require("./../config/env");
const UserRole = require("../models/UserRole");
const UserPermission = require("../models/UserPermission");

const createAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY_TIME,
  });
};

const createRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY_TIME,
  });
};

const getValidIds = async (ids, model) => {
  const verifiedIds = ids.filter((permission) =>
    mongoose.isValidObjectId(permission)
  );
  const verifiedObjects = await model
    .find({
      id: { $in: verifiedIds },
    })
    .select({ _id: 1 });
  return verifiedObjects.map((_) => _._id);
};

module.exports = {
  registerUser: async (req, res, next) => {
    const { email, fullName, password } = req.body;
    try {
      const salt = await bcrypt.genSalt();
      const newUser = {
        email: email,
        fullName: fullName,
        password: await bcrypt.hash(password, salt),
      };

      const user = await User.create(newUser);
      console.log({ msg: "new user created", user });

      res.send({ success: true, message: "User successfully created!" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  loginUser: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await User.login(email, password);

      const accessToken = createAccessToken(user._id);
      const refreshToken = createRefreshToken(user._id);

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();

      res.send({
        success: true,
        data: {
          email: user.email,
          fullName: user.fullName,
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  addUserAccessControl: async (req, res, next) => {
    const { user, roles, permissions } = req.body;
    if (!mongoose.isValidObjectId(user)) {
      throw new Error(`invalid format for user id field`);
    }
    const verifiedRoleIds = await getValidIds(roles, UserRole);
    const verifiedPermissionIds = await getValidIds(
      permissions,
      UserPermission
    );
    const response = await User.findByIdAndUpdate(user, {
      $push: {
        roles: { $each: verifiedRoleIds },
        permissions: { $each: verifiedPermissionIds },
      },
    });
    res.send({ success: true, data: response });
  },

  removeUserAccessControl: async (req, res, next) => {
    const { user, roles, permissions } = req.body;
    if (!mongoose.isValidObjectId(user)) {
      throw new Error(`invalid format for user id field`);
    }
    const verifiedRoleIds = await getValidIds(roles, UserRole);
    const verifiedPermissionIds = await getValidIds(
      permissions,
      UserPermission
    );
    const response = await User.findByIdAndUpdate(user, {
      $pull: {
        roles: { $in: verifiedRoleIds },
        permissions: { $in: verifiedPermissionIds },
      },
    });
    res.send({ success: true, data: response });
  },
};
