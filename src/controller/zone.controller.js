const Zone = require("../models/Zone");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the zone data by `id`
   */
  getZoneByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const zoneData = await Zone.findById(id);
      if (!zoneData) {
        res.status(404);
        return;
      }
      req.send(zoneData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a zone
   */
  createZone: async (req, res, next) => {
    const { name, type, specs, warehouse_id } = req.body;

    if (!(name && type)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const zoneData = new Zone({
        name,
        type,
        specs,
        warehouse_id: mongoose.Types.ObjectId(warehouse_id),
      });

      await zoneData.save();
      if (!zoneData) {
        res.status(404);
        return;
      }
      req.send(zoneData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a zones detail
   */
  updateZoneByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, type, specs, warehouse_id } = req.body;

    if (!(name || type || specs || warehouse_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const zoneData = await Zone.findById(id);
      if (!zoneData) {
        res.status(404);
        return;
      }

      if (name) zoneData.name = name;
      if (type) zoneData.type = type;
      if (specs) zoneData.specs = specs;
      if (warehouse_id) zoneData.warehouse_id = mongoose.Types.ObjectId(warehouse_id);

      await zoneData.save();
      req.send(zoneData);
    } catch (error) {
      next(error);
    }
  },
};
