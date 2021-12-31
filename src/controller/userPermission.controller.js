const mongoose = require("mongoose");

const UserPermission = require("./../models/UserPermission");
const { InventoryScopes, WarehouseScopes } = require("./../config/constants");

const getScopes = async (scopes, searchSet) => {
  const verifiedScopes = [];
  if (scopes !== undefined && Array.isArray(scopes)) {
    for (const scope of scopes) {
      if (mongoose.isValidObjectId(scope.id)) {
        if (scope.type !== undefined && searchSet.contains(scope.type)) {
          const model = require(`../models/${scope.type}`);
          const inventoryObject = await model.findById(scope.id);
          if (inventoryObject == undefined) {
            continue;
          }
          verifiedScopes.push({
            id: inventoryObject._id,
            type: scope.type,
          });
        }
      } else {
        throw new Error(`invalid data format for object-id - ${scope.id}`);
      }
    }
  }
  return verifiedScopes;
};

module.exports = {
  getAllPermissions: async (req, res, next) => {
    let { page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;

    const result = await UserPermission.find(
      {},
      { id: 1, name: 1, inventoryScopes: 1, warehouseScopes: 1, actions: 1 },
      { skip: page * perPage, limit: perPage }
    );
    res.send({ success: true, data: result });
  },
  getPermission: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (mongoose.isValidObjectId(id)) {
        const permission = await UserPermission.findById(id);
        res.send({ success: true, data: permission });
      } else {
        throw new Error(`invalid data format for object-id - ${id}`);
      }
    } catch (e) {
      next(e);
    }
  },
  createPermission: async (req, res, next) => {
    try {
      const { name, inventoryScopes, warehouseScopes, actions } = req.body;
      const verifiedInventoryScopes = await getScopes(
        inventoryScopes,
        InventoryScopes
      );
      const verifiedWarehouseScopes = await getScopes(
        warehouseScopes,
        WarehouseScopes
      );

      const newUserPermission = await UserPermission.create({
        name,
        inventoryScopes: verifiedInventoryScopes,
        warehouseScopes: verifiedWarehouseScopes,
        actions: actions == undefined ? [] : actions,
      });
      res.send({ success: true, data: newUserPermission });
    } catch (e) {
      next(e);
    }
  },
  updatePermission: async (req, res, next) => {
    // Need more clarity
    res.send({ success: false, error: "not implemented" });
  },
  deletePermission: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (mongoose.isValidObjectId(id)) {
        const result = await UserPermission.deleteOne({ _id: id });
        res.send({ success: true, data: result });
      } else {
        throw new Error(`invalid data format for object-id - ${id}`);
      }
    } catch (e) {
      next(e);
    }
  },
};
