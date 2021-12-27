const SubLevel = require("../models/SubLevel");
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
      const subLevelData = await SubLevel.findById(id);
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
    const { name, type, specs, main_level_id } = req.body;

    if (!(name && type && main_level_id)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const levelData = new SubLevel({
        name,
        type: type,
        specs,
        main_level_id: mongoose.Types.ObjectId(main_level_id),
      });

      await levelData.save();
      if (!levelData) {
        res.status(404);
        return;
      }
      req.send(levelData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a sublevels' detail
   */
  updateSubLevelByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, type, specs, main_level_id } = req.body;

    if (!(name || type || specs || main_level_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const levelData = await SubLevel.findById(id);
      if (!levelData) {
        res.status(404);
        return;
      }

      if (name) levelData.name = name;
      if (type) levelData.type = type;
      if (specs) levelData.specs = specs;
      if (main_level_id) {
        levelData.main_level_id = mongoose.Types.ObjectId(main_level_id);
      }

      await levelData.save();
      req.send(levelData);
    } catch (error) {
      next(error);
    }
  },
};
