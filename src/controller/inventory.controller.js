const Inventory = require("../models/Inventory");
const { InventoryTypes } = require("../config/constants");

module.exports = {
  /**
   * Gets the Inventory data by `id`
   */
  getInventoryByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const inventoryData = await Inventory.findById(id);
      if (!inventoryData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a Inventory
   */
  createInventory: async (req, res, next) => {
    const { name, type } = req.body;

    if (!(name && type)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const inventoryData = new Inventory({
        name,
        type,
      });

      await inventoryData.save();
      if (!inventoryData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a Inventory detail
   */
  updateInventoryByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, type } = req.body;

    if (!(name || type)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const inventoryData = await Inventory.findById(id);
      if (!inventoryData) {
        res.status(404);
        return;
      }

      if (name) inventoryData.name = name;
      if (type) inventoryData.type = type;

      await inventoryData.save();
      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Gets the Inventory data by `type`
   */
  getInventoryByType: async (req, res, next) => {
    let { type, page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;

    if (!type || !InventoryTypes.includes(type)) {
      res.status(400).send({ success: false, error: "Missing/Invalid type param" });
      return;
    }

    try {
      const inventoryData = await Inventory.find(
        { type: type },
        { id: 1, name: 1, type: 1 },
        { skip: parseInt(page) * parseInt(perPage), limit: parseInt(perPage) }
      );
      if (!inventoryData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },
};
