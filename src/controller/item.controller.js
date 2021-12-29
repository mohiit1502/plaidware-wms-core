const mongoose = require("mongoose");
const Item = require("../models/Item");
const Material = require("../models/Material");

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
};
