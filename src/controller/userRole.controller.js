const mongoose = require("mongoose");
const UserRole = require("../models/UserRole");
const UserPermission = require("../models/UserPermission");

const getValidPermissions = async (permissions) => {
  const verifiedPermissions = permissions.filter((permission) =>
    mongoose.isValidObjectId(permission)
  );
  const permissionObjects = await UserPermission.find({
    id: { $in: verifiedPermissions },
  }).select({ _id: 1 });
  return permissionObjects.map((_) => _._id);
};

module.exports = {
  getAllRoles: async (req, res, next) => {
    let { page, perPage } = req.query;
    page = page || 0;
    perPage = perPage || 10;

    const result = await UserRole.find(
      {},
      {
        id: 1,
        name: 1,
        permissions: 1,
      },
      { skip: page * perPage, limit: perPage }
    );
    res.send({ success: true, data: result });
  },
  getRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (mongoose.isValidObjectId(id)) {
        const role = await UserRole.findById(id);
        res.send({ success: true, data: role });
      } else {
        throw new Error(`invalid data format for object-id - ${id}`);
      }
    } catch (e) {
      next(e);
    }
  },
  createRole: async (req, res, next) => {
    try {
      const { name, permissions } = req.body;
      const verifiedPermissions = await getValidPermissions(permissions);
      const newUserRole = await UserRole.create({
        name,
        permissions: verifiedPermissions,
      });
      res.send({ success: true, data: newUserRole });
    } catch (e) {
      next(e);
    }
  },
  updateRole: async (req, res, next) => {
    // Need more clarity
    res.send({ success: false, error: "not implemented" });
  },
  deleteRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (mongoose.isValidObjectId(id)) {
        const result = await UserRole.deleteOne({ _id: id });
        res.send({ success: true, data: result });
      } else {
        throw new Error(`invalid data format for object-id - ${id}`);
      }
    } catch (e) {
      next(e);
    }
  },
};
