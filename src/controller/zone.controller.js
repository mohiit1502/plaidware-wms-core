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
      res.send(zoneData);
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
      res.send(zoneData);
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
      res.send(zoneData);
    } catch (error) {
      next(error);
    }
  },

  getAllZone: async (req, res, next) => {
    try {
      const { getAllWithPagination } = require("./utils/pagination");
      const { page, perPage } = req.query;
      const data = await getAllWithPagination(Zone, page, perPage);
      res.send({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },

  getZoneAreasByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, message: "Missing id param" });
      return;
    }

    try {
      const zoneData = await Zone.findById(id).populate("areas");
      if (!zoneData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, data: zoneData.areas });
    } catch (error) {
      next(error);
    }
  },
};
