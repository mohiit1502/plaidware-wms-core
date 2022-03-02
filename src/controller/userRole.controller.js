const mongoose = require("mongoose");
const UserRole = require("../models/UserRole");
const { getScopes } = require("./utils/access-control");
const { InventoryScopes, WarehouseScopes, UserActions, AllUIModules } = require("./../config/constants");

module.exports = {
  getAllRoles: async (req, res, next) => {
    let { page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;

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
      const {
        name,
        permissions: { inventoryScopes, warehouseScopes, actions, allowedUIModules },
        status,
      } = req.body;
      const verifiedInventoryScopes = await getScopes(inventoryScopes, InventoryScopes);
      const verifiedWarehouseScopes = await getScopes(warehouseScopes, WarehouseScopes);
      const newUserRole = await UserRole.create({
        name,
        status,
        permissions: {
          inventoryScopes: verifiedInventoryScopes,
          warehouseScopes: verifiedWarehouseScopes,
          actions: actions == undefined ? [] : actions.filter((_) => UserActions.includes(_)),
          allowedUIModules: allowedUIModules == undefined ? [] : allowedUIModules.filter((_) => AllUIModules.includes(_)),
        },
      });
      res.send({ success: true, data: newUserRole });
    } catch (e) {
      next(e);
    }
  },
  updateRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!(id && mongoose.isValidObjectId(id))) {
        res.status(400).send({ success: false, error: "invalid Id params" });
      }
      const role = await UserRole.findById(id);
      if (!role) {
        res.status(404).send({ success: false, error: "Role not found" });
      }

      const {
        name,
        permissions: { inventoryScopes, warehouseScopes, actions, allowedUIModules },
      } = req.body;

      if (name) {
        role.name = name;
        role.markModified("name");
      }
      if (inventoryScopes) {
        const verifiedInventoryScopes = await getScopes(inventoryScopes, InventoryScopes);
        role.permissions.inventoryScopes = verifiedInventoryScopes;
        role.markModified("permissions.inventoryScopes");
      }
      if (warehouseScopes) {
        const verifiedWarehouseScopes = await getScopes(warehouseScopes, WarehouseScopes);
        role.permissions.warehouseScopes = verifiedWarehouseScopes;
        role.markModified("permissions.warehouseScopes");
      }
      if (actions) {
        role.permissions.actions = actions.filter((_) => UserActions.includes(_));
        role.markModified("permissions.actions");
      }
      if (allowedUIModules) {
        role.permissions.allowedUIModules = allowedUIModules.filter((_) => AllUIModules.includes(_));
        role.markModified("permissions.allowedUIModules");
      }
      await role.save();
      res.send({ success: true, data: role });
    } catch (e) {
      next(e);
    }
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
