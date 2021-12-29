const mongoose = require("mongoose");
const Material = require("../models/Material");
const Inventory = require("../models/Inventory");

module.exports = {
  /**
   * Gets the Material data by `id`
   */
  getMaterialByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const materialData = await Material.findById(id);
      if (!materialData) {
        res.status(404);
        return;
      }
      req.send({ success: true, data: materialData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a Material
   */
  createMaterial: async (req, res, next) => {
    const { name, parentId, inventoryId } = req.body;

    try {
      let parent;
      if (parentId && mongoose.isValidObjectId(parentId)) {
        parent = await Material.findById(parent);
      } else if (parentId && !mongoose.isValidObjectId(parentId)) {
        res.status(400).send("Invalid params parentId");
        return;
      }

      let inventory;
      if (inventoryId && mongoose.isValidObjectId(inventoryId)) {
        inventory = await Inventory.findById(inventoryId);
      } else {
        res.status(400).send("Invalid params inventoryId");
        return;
      }

      const materialData = new Material({
        name,
        parent,
        inventory,
      });

      await materialData.save();
      if (!materialData) {
        res.status(404);
        return;
      }
      req.send({ success: true, data: materialData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a Material detail
   */
  updateMaterialByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, parentId, inventoryId } = req.body;

    if (!(name || parentId || inventoryId)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const materialData = await Material.findById(id);
      if (!materialData) {
        res.status(404);
        return;
      }

      if (name) {
        materialData.name = name;
      }

      let parent;
      if (parentId && mongoose.isValidObjectId(parentId)) {
        parent = await Material.findById(parent);
        materialData.parent = parent;
      } else if (parentId && !mongoose.isValidObjectId(parentId)) {
        res.status(400).send("Invalid params parentId");
        return;
      }

      let inventory;
      if (inventoryId && mongoose.isValidObjectId(inventoryId)) {
        inventory = await Inventory.findById(inventoryId);
        materialData.inventory = inventory;
      } else {
        res.status(400).send("Invalid params inventoryId");
        return;
      }

      await materialData.save();
      req.send({ success: true, data: materialData });
    } catch (error) {
      next(error);
    }
  },
};
