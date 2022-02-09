const Bay = require("../models/Bay");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the bay data by `id`
   */
  getBayByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const bayData = await Bay.findById(id);
      if (!bayData) {
        res.status(404);
        return;
      }
      res.send(bayData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a bay
   */
  createBay: async (req, res, next) => {
    const { name, number, type, specs, row_id } = req.body;

    if (!(name && type && number)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const bayData = new Bay({
        name,
        number: parseInt(number),
        type,
        specs,
        row_id: mongoose.Types.ObjectId(row_id),
      });

      await bayData.save();
      if (!bayData) {
        res.status(404);
        return;
      }
      res.send(bayData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a bays detail
   */
  updateBayByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, number, type, specs, row_id } = req.body;

    if (!(name || number || type || specs || row_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const bayData = await Bay.findById(id);
      if (!bayData) {
        res.status(404);
        return;
      }

      if (name) bayData.name = name;
      if (number) bayData.number = parseInt(number);
      if (type) bayData.type = type;
      if (specs) bayData.specs = specs;
      if (row_id) bayData.row_id = mongoose.Types.ObjectId(row_id);

      await bayData.save();
      res.send(bayData);
    } catch (error) {
      next(error);
    }
  },

  getAllBay: async (req, res, next) => {
    try {
      const { getAllWithPagination } = require("./utils/pagination");
      const { page, perPage } = req.query;
      const data = await getAllWithPagination(Bay, page, perPage);
      res.send({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },

  getBayLevelsByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, message: "Missing id param" });
      return;
    }

    try {
      const bayData = await Bay.findById(id).populate("levels");
      if (!bayData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, data: bayData.levels });
    } catch (error) {
      next(error);
    }
  },
};
