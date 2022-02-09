const Row = require("../models/Row");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the row data by `id`
   */
  getRowByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const rowData = await Row.findById(id);
      if (!rowData) {
        res.status(404);
        return;
      }
      res.send(rowData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a row
   */
  createRow: async (req, res, next) => {
    const { name, number, specs, area_id } = req.body;

    if (!(name && number)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const rowData = new Row({
        name,
        number: parseInt(number),
        specs,
        area_id: mongoose.Types.ObjectId(area_id),
      });

      await rowData.save();
      if (!rowData) {
        res.status(404);
        return;
      }
      res.send(rowData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a rows detail
   */
  updateRowByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, number, specs, area_id } = req.body;

    if (!(name || number || specs || area_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const rowData = await Row.findById(id);
      if (!rowData) {
        res.status(404);
        return;
      }

      if (name) rowData.name = name;
      if (number) rowData.number = parseInt(number);
      if (specs) rowData.specs = specs;
      if (area_id) rowData.area_id = mongoose.Types.ObjectId(area_id);

      await rowData.save();
      res.send(rowData);
    } catch (error) {
      next(error);
    }
  },

  getAllRow: async (req, res, next) => {
    try {
      const { getAllWithPagination } = require("./utils/pagination");
      const { page, perPage } = req.query;
      const data = await getAllWithPagination(Row, page, perPage);
      res.send({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },

  getRowBaysByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, message: "Missing id param" });
      return;
    }

    try {
      const rowData = await Row.findById(id).populate("bays");
      if (!rowData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, data: rowData.bays });
    } catch (error) {
      next(error);
    }
  },
};
