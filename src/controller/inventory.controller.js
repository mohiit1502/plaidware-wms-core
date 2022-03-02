const mongoose = require("mongoose");

const Inventory = require("../models/Inventory");
const WidgetFamily = require("../models/WidgetFamily");
const { InventoryTypes } = require("../config/constants");

module.exports = {
  /**
   * Gets the Inventory types
   */
  getInventoryTypes: async (req, res, next) => {
    res.send({ success: true, data: InventoryTypes });
  },

  /**
   * Gets the Inventory data by `id`
   */
  getInventoryByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, error: "Missing id param" });
      return;
    }

    try {
      const inventoryData = await Inventory.findById(id);
      if (!inventoryData) {
        res.status(404).send({ success: false, error: "Inventory not found" });
        return;
      }
      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },

  getInventories: async (req, res, next) => {
    let { page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;

    try {
      const inventoryData = await Inventory.find()
        .skip(parseInt(page) * parseInt(perPage))
        .limit(parseInt(perPage));
      if (!inventoryData) {
        res.status(404);
        return;
      }

      for (const inventory of inventoryData) {
        inventory["widgetFamilies"] = await WidgetFamily.find({ inventory: inventory._id });
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
    let { name, policies, widgetName, icon_slug } = req.body;

    if (!(name && widgetName && icon_slug)) {
      res.status(400).send("Missing params");
      return;
    }
    const preferredLocations = [];
    if (policies && policies.preferredLocations && Array.isArray(policies.preferredLocations)) {
      for (const preferredLocation of policies.preferredLocations) {
        preferredLocations.push({ id: preferredLocation.id, type: preferredLocation.type });
      }
    } else if (!policies) {
      policies = {};
    }

    const verifiedPolicies = {
      orderTracking: policies.orderTracking || false,
      alerting: policies.alerting || false,
      replenishment: policies.replenishment || false,
      preferredLocations: preferredLocations || false,
      inventory_process: policies.inventory_process,
    };

    try {
      const inventoryData = new Inventory({
        name,
        widgetName,
        policies: verifiedPolicies,
        icon_slug,
      });

      if (!inventoryData) {
        res.status(404);
        return;
      }
      await inventoryData.save();
      res.send({ success: true, data: { inventoryData } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a Inventory detail
   */
  updateInventoryByID: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!(id && mongoose.isValidObjectId(id))) {
        res.status(400).send("Missing/Improper id param");
        return;
      }

      const inventory = await Inventory.findById(id);

      if (!inventory) {
        res.status(400).send("Inventory not found");
        return;
      }
      let { name, policies, widgetName, icon_slug } = req.body;
      if (name) {
        inventory.name = name;
      }

      if (widgetName) {
        inventory.widgetName = widgetName;
      }

      if (icon_slug) {
        inventory.icon_slug = icon_slug;
      }
      if (!policies) {
        policies = {};
      }

      // const widgetFamilyData = createWidgetFamiliesData(inventory, widgetFamily);

      const verifiedPolicies = {
        orderTracking: policies.orderTracking !== undefined ? policies.orderTracking : inventory.policies.orderTracking,
        alerting: policies.alerting !== undefined ? policies.alerting : inventory.policies.alerting,
        replenishment: policies.replenishment !== undefined ? policies.replenishment : inventory.policies.replenishment,
        preferredLocations: policies.replenishment !== undefined ? policies.replenishment : inventory.policies.preferredLocations,
        inventory_process: policies.inventory_process || inventory.policies.inventory_process,
      };

      inventory.policies = verifiedPolicies;
      await inventory.save();
      res.send({ success: true, data: { inventory } });
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

      for (const inventory of inventoryData) {
        inventory["widgetFamilies"] = await WidgetFamily.find({ inventory: inventory._id });
      }

      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },
};
