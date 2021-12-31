const Area = require("../models/Area");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the area data by `id`
   */
  getAreaByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const areaData = await Area.findById(id);
      if (!areaData) {
        res.status(404);
        return;
      }
      res.send(areaData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a area
   */
  createArea: async (req, res, next) => {
    const { name, type, specs, zone_id } = req.body;

    if (!(name && type)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const areaData = new Area({
        name,
        type,
        specs,
        zone_id: mongoose.Types.ObjectId(zone_id),
      });

      await areaData.save();
      if (!areaData) {
        res.status(404);
        return;
      }
      res.send(areaData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a areas detail
   */
  updateAreaByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, type, specs, zone_id } = req.body;

    if (!(name || type || specs || zone_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const areaData = await Area.findById(id);
      if (!areaData) {
        res.status(404);
        return;
      }

      if (name) areaData.name = name;
      if (type) areaData.type = type;
      if (specs) areaData.specs = specs;
      if (zone_id) areaData.zone_id = mongoose.Types.ObjectId(zone_id);

      await areaData.save();
      res.send(areaData);
    } catch (error) {
      next(error);
    }
  },
};
