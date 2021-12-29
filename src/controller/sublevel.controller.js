const Sublevel = require("../models/Sublevel");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the sublevel data by `id`
   */
  getSubLevelByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const subLevelData = await Sublevel.findById(id);
      if (!subLevelData) {
        res.status(404);
        return;
      }
      req.send(subLevelData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a sublevel
   */
  createSubLevel: async (req, res, next) => {
    const { name, type, specs, parent_id, parentIsLevel } = req.body;

    if (!(name && type && parent_id)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const { parent_current_depth, parent_main_level_id } = parentIsLevel
        ? { parent_current_depth: 0, parent_main_level_id: parent_id }
        : await Sublevel.findById(parent_id);

      const sublevelData = new Sublevel({
        name,
        type: type,
        specs,
        main_level_id: parent_main_level_id,
        current_depth: parent_current_depth + 1,
        parent_sublevel_id: mongoose.Types.ObjectId(parent_id),
      });

      await sublevelData.save();
      if (!sublevelData) {
        res.status(404);
        return;
      }
      req.send(sublevelData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a sublevels' detail
   */
  updateSubLevelDetailsByID: async (req, res, next) => {
    const { name, type, specs } = req.body;
    const { id } = req.params;

    if (!(name || type || specs)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const sublevelData = await Sublevel.findById(id);
      if (!sublevelData) {
        res.status(404);
        return;
      }

      if (name) sublevelData.name = name;
      if (type) sublevelData.type = type;
      if (specs) sublevelData.specs = specs;

      const newData = await sublevelData.save();
      req.send(newData);
    } catch (error) {
      next(error);
    }
  },
};
