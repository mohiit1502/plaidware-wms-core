const Warehouse = require("../models/Warehouse");
const mongoose = require("mongoose");

module.exports = {
  getAllWarehouses: async (req, res, next) => {
    try {
      const warehouses = await Warehouse.find();
      res.send({ success: true, data: warehouses });
    } catch (error) {
      next(error);
    }
  },
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
      res.send(warehouseData);
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
      res.send(warehouseData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload an image for the warehouse
   */
  addWarehouseImage: async (req, res, next) => {
    console.dir("Warehouse image uploaded:", { file: req.file });

    const { id } = req.params;

    try {
      const warehouseDetails = await Warehouse.findById(id);
      if (!warehouseDetails) {
        res.send({ success: false, message: "ID not found" });
        return;
      }
      warehouseDetails.imageUrl = req.file.path;
      await warehouseDetails.save();
      res.send({ success: true, data: warehouseDetails });
    } catch (err) {
      next(err);
    }
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
      res.send(warehouseData);
    } catch (error) {
      next(error);
    }
  },
};
