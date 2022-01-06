const mongoose = require("mongoose");
const Item = require("../models/Item");
const WidgetFamily = require("../models/WidgetFamily");
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
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a Item
   */
  createItem: async (req, res, next) => {
    let widgetFamily;
    if (req.body.widgetFamilyId && mongoose.isValidObjectId(req.body.widgetFamilyId)) {
      widgetFamily = await WidgetFamily.findById(req.body.widgetFamilyId);
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
      widgetFamily: widgetFamily,
    };

    for (const key of Object.keys(item)) {
      if (item[key] === undefined) {
        res.status(400).send({ success: false, error: `Missing required param: "${key}"` });
        return;
      }
    }

    try {
      const itemData = new Item(item);

      await itemData.save();
      if (!itemData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a Item detail
   */
  updateItemByID: async (req, res, next) => {
    const { id } = req.params;
    let widgetFamily;
    if (req.body.widgetFamilyId && mongoose.isValidObjectId(req.body.widgetFamilyId)) {
      widgetFamily = await WidgetFamily.findById(req.body.widgetFamilyId);
    }

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
      widgetFamily: widgetFamily,
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
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gets the Items data by filter
   */
  getItemsByFilter: async (req, res, next) => {
    let { family, type, page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;
    let inventories;
    let widgetFamilies;
    let itemFilters;
    try {
      if (type && InventoryTypes.includes(type)) {
        inventories = await Inventory.find({ type });
      }

      const widgetFamilyFilters = [];
      if (inventories) {
        widgetFamilyFilters.push({
          inventory: { $in: inventories.map((_) => _._id) },
        });
      }

      if (family) {
        widgetFamilyFilters.push({
          name: family,
        });
      }
      if (widgetFamilyFilters.length > 0) {
        widgetFamilies = await WidgetFamily.find({
          $or: widgetFamilyFilters,
        });
      }

      if (widgetFamilies) {
        itemFilters = { widgetFamily: { $in: widgetFamilies.map((_) => _._id) } };
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
          widgetFamily: 1,
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
      ).populate({ path: "widgetFamily" });
      if (!itemData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },
};
