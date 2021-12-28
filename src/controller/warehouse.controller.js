const Warehouse = require("../models/Warehouse");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the warehouse data by `id`
   */
  getWarehouseByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const warehouseData = await Warehouse.findById(id);
      if (!warehouseData) {
        res.status(404);
        return;
      }
      req.send(warehouseData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a warehouse
   */
  createWarehouse: async (req, res, next) => {
    const { name, address, specs, company_id } = req.body;

    if (!(name && address)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const warehouseData = new Warehouse({
        name,
        address,
        specs,
        company_id: mongoose.Types.ObjectId(company_id),
      });

      await warehouseData.save();
      if (!warehouseData) {
        res.status(404);
        return;
      }
      req.send(warehouseData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload an image for the warehouse
   */
  addWarehouseImage: async (req, res, next) => {
    // req.file contains the `warehouse-image`
    console.dir({ file: req.file });
    res.send("ok");
  },

  /**
   * Update a warehouses detail
   */
  updateWarehouseByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, address, specs, company_id } = req.body;

    if (!(name || address || specs || company_id)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const warehouseData = await Warehouse.findById(id);
      if (!warehouseData) {
        res.status(404);
        return;
      }

      if (name) warehouseData.name = name;
      if (address) warehouseData.address = address;
      if (specs) warehouseData.specs = specs;
      if (company_id) warehouseData.company_id = mongoose.Types.ObjectId(company_id);

      await warehouseData.save();
      req.send(warehouseData);
    } catch (error) {
      next(error);
    }
  },
};
