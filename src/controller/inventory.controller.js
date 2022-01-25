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
    const { name, type, policies } = req.body;

    if (!(name && type)) {
      res.status(400).send("Missing params param");
      return;
    }
    const preferredLocations = [];
    if (policies && policies.preferredLocations && Array.isArray(policies.preferredLocations)) {
      for (const preferredLocation of policies.preferredLocations) {
        preferredLocations.push({ id: preferredLocation.id, type: preferredLocation.type });
      }
    }

    const verifiedPolicies = {
      orderTracking: policies.orderTracking || {},
      alerting: {
        lowestStockLevel: policies.alerting && policies.alerting.lowestStockLevel ? policies.alerting.lowestStockLevel : false,
        highestStockLevel: policies.alerting && policies.alerting.highestStockLevel ? policies.alerting.highestStockLevel : false,
        alertStockLevel: policies.alerting && policies.alerting.alertStockLevel ? policies.alerting.alertStockLevel : false,
        reOrderLevel: policies.alerting && policies.alerting.reOrderLevel ? policies.alerting.reOrderLevel : false,
      },
      replenishment: policies.replenishment || {},
      preferredLocations: preferredLocations,
    };

    try {
      const inventoryData = new Inventory({
        name,
        type,
        policies: verifiedPolicies,
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

    const { name, type, policies } = req.body;

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

      if (policies) {
        const preferredLocations = [];
        if (policies.preferredLocations && Array.isArray(policies.preferredLocations)) {
          for (const preferredLocation of policies.preferredLocations) {
            preferredLocations.push({ id: preferredLocation.id, type: preferredLocation.type });
          }
        }

        inventoryData.policies = {
          orderTracking: policies.orderTracking || inventoryData.policies.orderTracking,
          alerting: {
            lowestStockLevel:
              policies.alerting && policies.alerting.lowestStockLevel !== undefined
                ? policies.alerting.lowestStockLevel
                : inventoryData.policies.alerting.lowestStockLevel,
            highestStockLevel:
              policies.alerting && policies.alerting.highestStockLevel !== undefined
                ? policies.alerting.highestStockLevel
                : inventoryData.policies.alerting.highestStockLevel,
            alertStockLevel:
              policies.alerting && policies.alerting.alertStockLevel !== undefined
                ? policies.alerting.alertStockLevel
                : inventoryData.policies.alerting.alertStockLevel,
            reOrderLevel:
              policies.alerting && policies.alerting.reOrderLevel !== undefined
                ? policies.alerting.reOrderLevel
                : inventoryData.policies.alerting.reOrderLevel,
          },
          replenishment: policies.replenishment || inventoryData.policies.replenishment,
          preferredLocations: preferredLocations,
        };
      }

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

      for (const inventory of inventoryData) {
        inventory["widgetFamilies"] = await WidgetFamily.find({ inventory: inventory._id });
      }

      res.send({ success: true, data: inventoryData });
    } catch (error) {
      next(error);
    }
  },
};
