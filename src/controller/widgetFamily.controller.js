const mongoose = require("mongoose");
const WidgetFamily = require("../models/WidgetFamily");
const Inventory = require("../models/Inventory");

module.exports = {
  /**
   * Gets the WidgetFamily data by `id`
   */
  getWidgetFamilyByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const widgetFamilyData = await WidgetFamily.findById(id);
      if (!widgetFamilyData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: widgetFamilyData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a WidgetFamily
   */
  createWidgetFamily: async (req, res, next) => {
    const { name, parentId, inventoryId } = req.body;

    try {
      let parent;
      if (parentId && mongoose.isValidObjectId(parentId)) {
        parent = await WidgetFamily.findById(parentId);
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

      const widgetFamilyData = new WidgetFamily({
        name,
        parent,
        inventory,
      });

      await widgetFamilyData.save();
      if (!widgetFamilyData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: widgetFamilyData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a WidgetFamily detail
   */
  updateWidgetFamilyByID: async (req, res, next) => {
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
      const widgetFamilyData = await WidgetFamily.findById(id);
      if (!widgetFamilyData) {
        res.status(404);
        return;
      }

      if (name) {
        widgetFamilyData.name = name;
      }

      let parent;
      if (parentId && mongoose.isValidObjectId(parentId)) {
        parent = await WidgetFamily.findById(parentId);
        widgetFamilyData.parent = parent;
      } else if (parentId && !mongoose.isValidObjectId(parentId)) {
        res.status(400).send("Invalid params parentId");
        return;
      }

      let inventory;
      if (inventoryId && mongoose.isValidObjectId(inventoryId)) {
        inventory = await Inventory.findById(inventoryId);
        widgetFamilyData.inventory = inventory;
      } else if (inventoryId && !mongoose.isValidObjectId(inventoryId)) {
        res.status(400).send("Invalid params inventoryId");
        return;
      }

      await widgetFamilyData.save();
      res.send({ success: true, data: widgetFamilyData });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Gets the WidgetFamily data by `inventory`
   */
  getWidgetFamilyByInventory: async (req, res, next) => {
    let { inventory, page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 0;

    if (!inventory || !mongoose.isValidObjectId(inventory)) {
      res.status(400).send("Missing inventory param");
      return;
    }

    try {
      const widgetFamilyData = await WidgetFamily.find(
        { inventory: inventory },
        { id: 1, name: 1, parent: 1, inventory: 1 },
        { skip: page * perPage, limit: perPage }
      )
        .populate({ path: "parent" })
        .populate({ path: "inventory" });
      if (!widgetFamilyData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: widgetFamilyData });
    } catch (error) {
      next(error);
    }
  },
};
