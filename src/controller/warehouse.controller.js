const Warehouse = require("../models/Warehouse");
const mongoose = require("mongoose");
const { S3 } = require("./../config/aws");
const Inventory = require("../models/Inventory");

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
      if (warehouseData.image_url) {
        warehouseData.image_url = S3.generatePresignedUrl(warehouseData.image_url);
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
    const { name, address, specs, company_id, preferredInventories } = req.body;

    if (!(name && address)) {
      res.status(400).send("Missing params param");
      return;
    }

    let preferredInventoryObjects;
    if (preferredInventories) {
      preferredInventoryObjects = await Inventory.find({ _id: { $in: preferredInventories } });
    }
    try {
      const warehouseData = new Warehouse({
        name,
        address,
        specs,
        company_id: mongoose.Types.ObjectId(company_id),
        preferredInventories: preferredInventoryObjects,
      });

      await warehouseData.save();
      if (!warehouseData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }

      const image = req.file;
      if (image) {
        const url = await S3.uploadFile(`warehouse/${warehouseData._id.toString()}.${image.originalname.split(".").slice(-1).pop()}`, image.path);
        warehouseData.image_url = url;
        await warehouseData.save();
      }
      if (warehouseData.image_url) {
        warehouseData.image_url = S3.generatePresignedUrl(warehouseData.image_url);
      }
      res.send({ success: true, message: warehouseData });
    } catch (error) {
      next(error);
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

    const { name, address, specs, company_id, preferredInventories } = req.body;
    const image = req.file;
    if (!(name || address || specs || company_id || image)) {
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
      if (image) {
        const url = await S3.uploadFile(`warehouseData/${warehouseData._id.toString()}.${image.originalname.split(".").slice(-1).pop()}`, image.path);
        warehouseData.image_url = url;
      }
      if (preferredInventories) {
        const preferredInventoryObjects = await Inventory.find({ _id: { $in: preferredInventories } });
        warehouseData.preferredInventories = preferredInventoryObjects;
      }
      await warehouseData.save();
      if (warehouseData.image_url) {
        warehouseData.image_url = S3.generatePresignedUrl(warehouseData.image_url);
      }
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
      for (const warehouse of data) {
        if (warehouse.image_url) warehouse.image_url = S3.generatePresignedUrl(warehouse.image_url);
      }
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
  addImageToWarehouse: async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "invalid id" });
    }

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      res.status(404).send({ success: false, error: "warehouse not found" });
    }

    const image = req.file;
    const url = await S3.uploadFile(
      `warehouse/${warehouse._id.toString()}-${Date.now()}-0.${image.originalname.split(".").slice(-1).pop()}`,
      image.path
    );
    warehouse.images = warehouse.images || [];
    warehouse.images.push({ url });
    await warehouse.save();

    res.send({ success: true, data: warehouse });
  },

  removeImageFromWarehouse: async (req, res, next) => {
    const { id, image_id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "invalid id" });
    }
    if (!mongoose.isValidObjectId(image_id)) {
      res.status(400).send({ success: false, error: "invalid image_id" });
    }

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      res.status(404).send({ success: false, error: "warehouse not found" });
    }

    warehouse.images = warehouse.images.filter((warehouseImage) => {
      return warehouseImage._id.toString() != image_id;
    });

    await warehouse.save();
    res.send({ success: true, data: warehouse });
  },

  deleteWarehouseByID: async (req, res, next) => {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "Missing/Invalid warehouse id" });
    }
    try {
      await Warehouse.deleteOne({ _id: id });
      res.send({ success: true, error: "Warehouse Successfully deleted" });
    } catch (error) {
      next(error);
    }
  },
};
