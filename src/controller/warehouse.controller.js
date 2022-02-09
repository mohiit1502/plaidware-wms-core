const Warehouse = require("../models/Warehouse");
const mongoose = require("mongoose");

module.exports = {
  /**
   * Gets the warehouse data by `id`
   */
  getWarehouseByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, message: "Missing id param" });
      return;
    }

    try {
      const warehouseData = await Warehouse.findById(id);
      if (!warehouseData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, data: warehouseData });
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
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, message: warehouseData });
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
      res.status(400).send({ success: false, message: "Missing ID param" });
      return;
    }

    const { name, address, specs, company_id } = req.body;

    if (!(name || address || specs || company_id)) {
      res.status(400).send({ success: false, message: "Missing data in body" });
      return;
    }

    try {
      const warehouseData = await Warehouse.findById(id);
      if (!warehouseData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }

      if (name) warehouseData.name = name;
      if (address) warehouseData.address = address;
      if (specs) warehouseData.specs = specs;
      if (company_id) warehouseData.company_id = mongoose.Types.ObjectId(company_id);

      await warehouseData.save();
      res.send({ success: true, data: warehouseData });
    } catch (error) {
      next(error);
    }
  },

  getAllWarehouse: async (req, res, next) => {
    try {
      const { getAllWithPagination } = require("./utils/pagination");
      const { page, perPage } = req.query;
      const data = await getAllWithPagination(Warehouse, page, perPage);
      res.send({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },

  getWarehouseZonesByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, message: "Missing id param" });
      return;
    }

    try {
      const warehouseData = await Warehouse.findById(id).populate("zones");
      if (!warehouseData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, data: warehouseData.zones });
    } catch (error) {
      next(error);
    }
  },
};
