const mongoose = require("mongoose");
const Item = require("../models/Item");
const Material = require("../models/Material");
const Inventory = require("../models/Inventory");
const { InventoryTypes } = require("../config/constants");

module.exports = {
  /**
   * Gets the Item data by `id`
   */
  getItemByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const itemData = await Item.findById(id);
      if (!itemData) {
        res.status(404);
        return;
      }
      req.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a Item
   */
  createItem: async (req, res, next) => {
    let material;
    if (req.body.materialId && mongoose.isValidObjectId(req.body.materialId)) {
      material = await Material.findById(material);
    }
    const item = {
      commonName: req.body.commonName,
      formalName: req.body.formalName,
      description: req.body.description,
      manufacturer: req.body.manufacturer,
      size: req.body.size,
      color: req.body.color,
      type: req.body.type,
      unitOfMaterial: req.body.unitOfMaterial,
      unitCost: req.body.unitCost,
      packageCount: req.body.packageCount,
      countPerPallet: req.body.countPerPallet,
      countPerPalletPackage: req.body.countPerPalletPackage,
      customAttributes: req.body.customAttributes,
      material,
    };

    if (Object.values(item).every((_) => _)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const itemData = new Item(item);

      await itemData.save();
      if (!itemData) {
        res.status(404);
        return;
      }
      req.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a Item detail
   */
  updateItemByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const item = {
      commonName: req.body.commonName,
      formalName: req.body.formalName,
      description: req.body.description,
      manufacturer: req.body.manufacturer,
      size: req.body.size,
      color: req.body.color,
      type: req.body.type,
      unitOfMaterial: req.body.unitOfMaterial,
      unitCost: req.body.unitCost,
      packageCount: req.body.packageCount,
      countPerPallet: req.body.countPerPallet,
      countPerPalletPackage: req.body.countPerPalletPackage,
      customAttributes: req.body.customAttributes,
    };

    try {
      const itemData = await Item.findById(id);
      if (!itemData) {
        res.status(404);
        return;
      }

      for (const key of Object.keys(item)) {
        if (item[key] !== undefined) {
          itemData[key] = item[key];
        }
      }

      await itemData.save();
      req.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gets the Items data by filter
   */
  getItemsByFilter: async (req, res, next) => {
    let { family, type, page, perPage } = req.query;
    page = page || 0;
    perPage = perPage || 10;
    let inventories;
    let materials;
    let itemFilters;
    try {
      if (type && InventoryTypes.includes(type)) {
        inventories = await Inventory.find({ type });
      }

      const materialFilters = [];
      if (inventories) {
        materialFilters.push({
          inventory: { $in: inventories.map((_) => _._id) },
        });
      }

      if (family) {
        materialFilters.push({
          name: family,
        });
      }
      if (materialFilters.length > 0) {
        materials = await Material.find({
          $or: materialFilters,
        });
      }

      if (materials) {
        itemFilters = { material: { $in: materials.map((_) => _._id) } };
      } else {
        itemFilters = {};
      }
      const itemData = await Item.find(
        itemFilters,
        {
          id: 1,
          commonName: 1,
          formalName: 1,
          description: 1,
          manufacturer: 1,
          size: 1,
          color: 1,
          type: 1,
          unitOfMaterial: 1,
          unitCost: 1,
          packageCount: 1,
          countPerPallet: 1,
          countPerPalletPackage: 1,
          customAttributes: 1,
        },
        { skip: page * perPage, limit: perPage }
      );
      if (!itemData) {
        res.status(404);
        return;
      }
      req.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },
};
