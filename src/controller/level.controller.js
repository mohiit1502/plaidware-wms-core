const Level = require("../models/Level");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the level data by `id`
   */
  getLevelByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const levelData = await Level.findById(id);
      if (!levelData) {
        res.status(404);
        return;
      }
      res.send(levelData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a level
   */
  createLevel: async (req, res, next) => {
    const { name, number, specs, bay_id } = req.body;

    if (!(name && number)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const levelData = new Level({
        name,
        number: parseInt(number),
        specs,
        bay_id: mongoose.Types.ObjectId(bay_id),
      });

      await levelData.save();
      if (!levelData) {
        res.status(404);
        return;
      }
      res.send(levelData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a levels detail
   */
  updateLevelByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, number, specs, bay_id } = req.body;

    if (!(name || number || specs || bay_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const levelData = await Level.findById(id);
      if (!levelData) {
        res.status(404);
        return;
      }

      if (name) levelData.name = name;
      if (number) levelData.number = parseInt(number);
      if (specs) levelData.specs = specs;
      if (bay_id) levelData.bay_id = mongoose.Types.ObjectId(bay_id);

      await levelData.save();
      res.send(levelData);
    } catch (error) {
      next(error);
    }
  },

  getAllLevel: async (req, res, next) => {
    try {
      const { getAllWithPagination } = require("./utils/pagination");
      const { page, perPage } = req.query;
      const data = await getAllWithPagination(Level, page, perPage);
      res.send({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },
};
