const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./../models/User");
const { JWT_SECRET, JWT_REFRESH_EXPIRY_TIME, JWT_ACCESS_EXPIRY_TIME } = require("./../config/env");
const UserRole = require("../models/UserRole");
const { getScopes } = require("./utils/access-control");
const { InventoryScopes, WarehouseScopes, UserActions, AllUIModules } = require("./../config/constants");
const { S3 } = require("./../config/aws");

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
    const { email, fullName, password, createdBy } = req.body;
    try {
      let createdByUser;
      if (createdBy && mongoose.isValidObjectId(createdBy)) {
        createdByUser = await User.findById(createdBy);
      }
      const salt = await bcrypt.genSalt();
      const newUser = {
        email: email,
        fullName: fullName,
        password: await bcrypt.hash(password, salt),
      };

      if (createdByUser) {
        newUser["createdBy"] = createdByUser;
      }

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
    const {
      roles,
      permissions: { inventoryScopes, warehouseScopes, actions, allowedUIModules },
    } = req.body;
    if (!mongoose.isValidObjectId(user)) {
      throw new Error(`invalid format for user id field`);
    }
    const userObject = await User.findById(user);
    if (!userObject) {
      res.status(404).send({ success: false, error: "User not found" });
    }

    if (roles) {
      let verifiedRoleIds = await getValidIds(roles, UserRole);
      verifiedRoleIds = verifiedRoleIds || [];
      userObject.roles = Array.from(new Set([...userObject.roles, ...verifiedRoleIds]));
    }

    if (inventoryScopes) {
      const verifiedInventoryScopes = await getScopes(inventoryScopes, InventoryScopes);
      userObject.permissions.inventoryScopes = Array.from(new Set([...userObject.permissions.inventoryScopes, ...verifiedInventoryScopes]));
    }
    if (warehouseScopes) {
      const verifiedWarehouseScopes = await getScopes(warehouseScopes, WarehouseScopes);
      userObject.permissions.warehouseScopes = Array.from(new Set([...userObject.permissions.warehouseScopes, ...verifiedWarehouseScopes]));
    }
    if (actions) {
      userObject.permissions.actions = Array.from(new Set([...userObject.permissions.actions, ...actions.filter((_) => UserActions.includes(_))]));
    }
    if (allowedUIModules) {
      userObject.permissions.allowedUIModules = Array.from(
        new Set([...userObject.permissions.allowedUIModules, ...allowedUIModules.filter((_) => AllUIModules.includes(_))])
      );
    }
    await userObject.save();
    res.send({ success: true, data: userObject });
  },

  removeUserAccessControl: async (req, res, next) => {
    const { user } = req.params;
    const {
      roles,
      permissions: { inventoryScopes, warehouseScopes, actions, allowedUIModules },
    } = req.body;
    if (!mongoose.isValidObjectId(user)) {
      throw new Error(`invalid format for user id field`);
    }
    const userObject = await User.findById(user);
    if (!userObject) {
      res.status(404).send({ success: false, error: "User not found" });
    }

    if (roles) {
      let verifiedRoleIds = await getValidIds(roles, UserRole);
      verifiedRoleIds = verifiedRoleIds || [];
      userObject.roles = userObject.roles.filter((_) => !verifiedRoleIds.includes(_));
    }

    if (inventoryScopes) {
      const verifiedInventoryScopes = await getScopes(inventoryScopes, InventoryScopes);
      userObject.permissions.inventoryScopes = userObject.permissions.inventoryScopes.filter((_) => !verifiedInventoryScopes.includes(_.id));
    }
    if (warehouseScopes) {
      const verifiedWarehouseScopes = await getScopes(warehouseScopes, WarehouseScopes);
      userObject.permissions.warehouseScopes = userObject.permissions.warehouseScopes.filter((warehouseScope) => {
        for (const verifiedWarehouseScope of verifiedWarehouseScopes) {
          if (verifiedWarehouseScope.id == warehouseScope.id && verifiedWarehouseScope.type == warehouseScope.type) {
            return false;
          }
        }
      });
    }
    if (actions) {
      userObject.permissions.actions = userObject.permissions.actions.filter((_) => !actions.includes(_));
    }
    if (allowedUIModules) {
      userObject.permissions.allowedUIModules = userObject.permissions.allowedUIModules.filter((_) => !allowedUIModules.includes(_));
    }
    await userObject.save();
    res.send({ success: true, data: userObject });
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

      const result = await User.find()
        .skip(page * perPage)
        .limit(perPage)
        .populate({ path: "roles", populate: "permissions" })
        .populate("permissions")
        .populate("createdBy")
        .populate("updatedBy");
      for (const user of result) {
        if (user.image_url) user.image_url = S3.generatePresignedUrl(user.image_url);
      }
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
      const result = await User.findOne({ _id: id })
        .populate("roles")
        .populate("createdBy");
      if (result._doc.image_url) result._doc.image_url = S3.generatePresignedUrl(result._doc.image_url);
      res.send({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  createUser: async (req, res, next) => {
    let {
      fullName,
      email,
      password,
      phoneNumber,
      roles,
      permissions,
    } = req.body;
    permissions = permissions ? JSON.parse(permissions) : {};
    const { inventoryScopes, warehouseScopes, actions, allowedUIModules } = permissions;

    try {
      const salt = await bcrypt.genSalt();
      const passwordEncrypted = password && await bcrypt.hash(password, salt);
      const newUser = {
        fullName,
        email,
        phoneNumber,
        isActive: true,
        createdBy: res.locals.user,
        createdAt: new Date()
      };
      passwordEncrypted && (newUser.password = passwordEncrypted);

      if (roles) {
        let verifiedRoleIds = roles && await getValidIds(roles.split(','), UserRole);
        verifiedRoleIds = verifiedRoleIds || [];
        newUser.roles = verifiedRoleIds;
      }

      newUser.permissions = {};
      if (inventoryScopes) {
        const verifiedInventoryScopes = await getScopes(inventoryScopes, InventoryScopes);
        newUser.permissions.inventoryScopes = verifiedInventoryScopes;
      }
      if (warehouseScopes) {
        const verifiedWarehouseScopes = await getScopes(warehouseScopes, WarehouseScopes);
        newUser.permissions.warehouseScopes = verifiedWarehouseScopes;
      }
      if (actions) {
        newUser.permissions.actions = actions.filter((_) => UserActions.includes(_));
      }
      if (allowedUIModules) {
        newUser.permissions.allowedUIModules = allowedUIModules.filter((_) => AllUIModules.includes(_));
      }
      const user = await User.create(newUser);
      console.log({ msg: "new user created", user });
      const image = req.file;
      if (image) {
        const url = await S3.uploadFile(`user/${user._id.toString()}.${image.originalname.split(".").slice(-1).pop()}`, image.path);
        user.image_url = url;
        await user.save();
      }
      res.send({ success: true, data: image ? { ...user?._doc, image_url: S3.generatePresignedUrl(user._doc.image_url) } : { ...user?._doc } });
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

    try {
      let {
        fullName,
        email,
        password,
        phoneNumber,
        roles,
        isActive,
        permissions
      } = req.body;
      permissions = permissions ? JSON.parse(permissions) : {};
      const { inventoryScopes, warehouseScopes, actions, allowedUIModules } = permissions;
      const user = await User.findById(id);
      if (!user) {
        res.status(404).send({ success: false, error: "User not found" });
        return;
      }
      const salt = await bcrypt.genSalt();

      if (fullName) user.fullName = fullName;
      if (email) user.email = email;
      if (password) user.password = await bcrypt.hash(password, salt);
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (isActive !== undefined) user.isActive = isActive;
      user.updatedBy = res.locals.user;
      user.updatedAt = new Date();
      if (roles) {
        let verifiedRoleIds = roles && await getValidIds(roles.split(','), UserRole);
        verifiedRoleIds = verifiedRoleIds || [];
        user.roles = verifiedRoleIds;
      }
      if (inventoryScopes) {
        const verifiedInventoryScopes = await getScopes(inventoryScopes, InventoryScopes);
        user.permissions.inventoryScopes = verifiedInventoryScopes;
        user.markModified("permissions.inventoryScopes");
      }
      if (warehouseScopes) {
        const verifiedWarehouseScopes = await getScopes(warehouseScopes, WarehouseScopes);
        user.permissions.warehouseScopes = verifiedWarehouseScopes;
        user.markModified("permissions.warehouseScopes");
      }
      if (actions) {
        user.permissions.actions = actions.filter((_) => UserActions.includes(_));
        user.markModified("permissions.actions");
      }
      if (allowedUIModules) {
        user.permissions.allowedUIModules = allowedUIModules.filter((_) => AllUIModules.includes(_));
        user.markModified("permissions.allowedUIModules");
      }

      const image = req.file;
      if (image) {
        const url = await S3.uploadFile(`user/${user._id.toString()}.${image.originalname.split(".").slice(-1).pop()}`, image.path);
        user.image_url = url;
      }

      await user.save();

      res.send({ success: true, data: image ? { ...user._doc, image_url: S3.generatePresignedUrl(user._doc.image_url) } : { ...user._doc } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
