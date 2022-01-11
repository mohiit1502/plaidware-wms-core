const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./../models/User");
const { JWT_SECRET, JWT_REFRESH_EXPIRY_TIME, JWT_ACCESS_EXPIRY_TIME } = require("./../config/env");
const UserRole = require("../models/UserRole");
const UserPermission = require("../models/UserPermission");
const { AllUIModules } = require("../config/constants");

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
  if (!ids) return [];
  const verifiedIds = ids.filter((permission) => mongoose.isValidObjectId(permission));
  const verifiedObjects = await model
    .find({
      _id: { $in: verifiedIds },
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
    const { user } = req.params;
    const { roles, permissions } = req.body;
    if (!mongoose.isValidObjectId(user)) {
      throw new Error(`invalid format for user id field`);
    }

    let verifiedRoleIds = await getValidIds(roles, UserRole);
    let verifiedPermissionIds = await getValidIds(permissions, UserPermission);
    verifiedRoleIds = verifiedRoleIds || [];
    verifiedPermissionIds = verifiedPermissionIds || [];

    const response = await User.findByIdAndUpdate(
      user,
      {
        $push: {
          roles: { $each: verifiedRoleIds },
          permissions: { $each: verifiedPermissionIds },
        },
      },
      { returnDocument: "after" }
    );
    res.send({ success: true, data: response });
  },

  removeUserAccessControl: async (req, res, next) => {
    const { user } = req.params;
    const { roles, permissions } = req.body;
    if (!mongoose.isValidObjectId(user)) {
      throw new Error(`invalid format for user id field`);
    }
    const verifiedRoleIds = await getValidIds(roles, UserRole);
    const verifiedPermissionIds = await getValidIds(permissions, UserPermission);
    const response = await User.findByIdAndUpdate(
      user,
      {
        $pull: {
          roles: { $in: verifiedRoleIds },
          permissions: { $in: verifiedPermissionIds },
        },
      },
      { returnDocument: "after" }
    );
    res.send({ success: true, data: response });
  },

  getUIAccessControl: async (req, res, next) => {
    try {
      const user = res.locals.user;

      const userUIPermissions = [];

      for (const role of user.roles) {
        for (const permission of role.permissions) {
          if (AllUIModules.includes(permission.name) && !userUIPermissions.includes(permission.name)) {
            userUIPermissions.push(permission.name);
          }
        }
      }

      for (const permission of user.permissions) {
        if (AllUIModules.includes(permission.name) && !userUIPermissions.includes(permission.name)) {
          userUIPermissions.push(permission.name);
        }
      }

      res.send({ success: true, data: userUIPermissions });
    } catch (error) {
      next(error);
    }
  },
  getAllUsers: async (req, res, next) => {
    try {
      let { page, perPage } = req.query;
      page = page ? parseInt(page) : 0;
      perPage = perPage ? parseInt(perPage) : 10;

      const result = await User.find(
        {},
        { id: 1, fullName: 1, email: 1, roles: 1, permissions: 1, createdBy: 1 },
        { skip: page * perPage, limit: perPage }
      )
        .populate({ path: "roles", populate: "permissions" })
        .populate("permissions")
        .populate("createdBy");
      res.send({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  getUserById: async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "Invalid data for user ID" });
      return;
    }

    try {
      const result = await User.findOne({ _id: id }, { id: 1, fullName: 1, email: 1, roles: 1, permissions: 1, createdBy: 1 })
        .populate({ path: "roles", populate: "permissions" })
        .populate("permissions")
        .populate("createdBy");
      res.send({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  createUser: async (req, res, next) => {
    const { email, fullName, password } = req.body;
    try {
      const salt = await bcrypt.genSalt();
      const newUser = {
        email: email,
        fullName: fullName,
        password: await bcrypt.hash(password, salt),
        createdBy: res.locals.user,
      };

      const user = await User.create(newUser);
      console.log({ msg: "new user created", user });

      res.send({ success: true, data: user });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  updateUser: async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "Invalid data for user ID" });
      return;
    }

    const { email, fullName, password } = req.body;
    try {
      const user = await User.findById(id);
      if (!user) {
        res.status(404).send({ success: false, error: "User not found" });
        return;
      }
      const salt = await bcrypt.genSalt();

      if (email) user.email = email;
      if (fullName) user.fullName = fullName;
      if (password) user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.send({ success: true, data: user });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
