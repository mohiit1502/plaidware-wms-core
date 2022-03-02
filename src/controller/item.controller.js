const mongoose = require("mongoose");
const Item = require("../models/Item");
const WidgetFamily = require("../models/WidgetFamily");
const {
  PickItemTransaction,
  PutItemTransaction,
  ReserveItemTransaction,
  CheckInItemTransaction,
  CheckOutItemTransaction,
  ReportItemTransaction,
  AdjustItemTransaction,
} = require("../models/ItemTransaction");
const { S3 } = require("./../config/aws");
const ItemAssociation = require("../models/ItemAssociation");
const Sublevel = require("../models/Sublevel");
const { ReportItemForTypes } = require("../config/constants");
const { filterItems, filterItemAssociations } = require("./utils/aggregation");
module.exports = {
  /**
   * Gets the Item data by `id`
   */
  getItemByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, error: "Missing id param" });
      return;
    }

    try {
      const itemData = await Item.findById(id).populate({ path: "widgetFamily", populate: "inventory" });
      if (!itemData) {
        res.status(404).send({ success: false, error: "Item not found" });
        return;
      }
      if (itemData.images && itemData.images.length > 0) {
        itemData.images = itemData.images.map((_) => {
          return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
        });
      }

      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a Item
   */
  createItem: async (req, res, next) => {
    let widgetFamily;
    if (req.body.widgetFamilyId && mongoose.isValidObjectId(req.body.widgetFamilyId)) {
      widgetFamily = await WidgetFamily.findById(req.body.widgetFamilyId);
    }
    const item = {
      commonName: req.body.commonName,
      formalName: req.body.formalName,
      description: req.body.description,
      manufacturer: req.body.manufacturer,
      size: req.body.size,
      color: req.body.color,
      type: req.body.type,
      unitOfMaterial: req.body.unitOfMaterial,
      unitCost: req.body.unitCost,
      packageCount: req.body.packageCount,
      countPerPallet: req.body.countPerPallet,
      countPerPalletPackage: req.body.countPerPalletPackage,
      customAttributes: req.body.customAttributes,
      widgetFamily: widgetFamily,
      policiesMetadata: {
        underStockLevelCount: req.body.policiesMetadata.underStockLevelCount,
        overStockLevelCount: req.body.policiesMetadata.overStockLevelCount,
        alertStockLevelCount: req.body.policiesMetadata.alertStockLevelCount,
        reorderStockLevelCount: req.body.policiesMetadata.reorderStockLevelCount,
      },
    };

    for (const key of Object.keys(item)) {
      if (["customAttributes"].includes(key)) continue;
      if (item[key] === undefined) {
        res.status(400).send({ success: false, error: `Missing required param: "${key}"` });
        return;
      }
    }

    try {
      const itemData = new Item(item);

      await itemData.save();
      if (!itemData) {
        res.status(404);
        return;
      }

      const images = req.files;

      for (let i = 0; i < images.length; i++) {
        const url = await S3.uploadFile(
          `item/${itemData._id.toString()}-${Date.now()}-${i}.${images[i].originalname.split(".").slice(-1).pop()}`,
          images[i].path
        );
        itemData.images = itemData.images || [];
        itemData.images.push({ url });
      }
      itemData.save();

      if (itemData.images) {
        itemData.images = itemData.images.map((_) => {
          return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
        });
      }
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a Item detail
   */
  updateItemByID: async (req, res, next) => {
    const { id } = req.params;
    let widgetFamily;
    if (req.body.widgetFamilyId && mongoose.isValidObjectId(req.body.widgetFamilyId)) {
      widgetFamily = await WidgetFamily.findById(req.body.widgetFamilyId);
    }

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const item = {
      commonName: req.body.commonName,
      formalName: req.body.formalName,
      description: req.body.description,
      manufacturer: req.body.manufacturer,
      size: req.body.size,
      color: req.body.color,
      type: req.body.type,
      unitOfMaterial: req.body.unitOfMaterial,
      unitCost: req.body.unitCost,
      packageCount: req.body.packageCount,
      countPerPallet: req.body.countPerPallet,
      countPerPalletPackage: req.body.countPerPalletPackage,
      customAttributes: req.body.customAttributes,
      widgetFamily: widgetFamily,
    };

    try {
      const itemData = await Item.findById(id);
      if (!itemData) {
        res.status(404);
        return;
      }

      for (const key of Object.keys(item)) {
        if (item[key] !== undefined) {
          itemData[key] = item[key];
        }
      }
      // Removal of images
      const existingImageIds = req.body.imageIds || [];
      itemData.images = itemData.images.filter((image) => {
        if (!image) return false;
        return existingImageIds.includes(image._id.toString());
      });
      // Addition of images
      const images = req.files;
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const url = await S3.uploadFile(
            `item/${itemData._id.toString()}-${Date.now()}-${i}.${images[i].originalname.split(".").slice(-1).pop()}`,
            images[i].path
          );
          itemData.images = itemData.images || [];
          itemData.images.push({ url });
        }
      }

      await itemData.save();

      if (itemData.images) {
        itemData.images = itemData.images.map((_) => {
          return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
        });
      }
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gets the Items data by filter
   */
  getItemsByFilter: async (req, res, next) => {
    let { family, inventory, page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;
    try {
      const results = await filterItems(inventory, family, page, perPage);

      for (const item of results[0].result) {
        if (item.images) {
          item.images = item.images.map((_) => {
            return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
          });
        }
      }
      res.send({ success: true, data: results[0] });
    } catch (error) {
      next(error);
    }
  },
  getItemAssociationsByFilter: async (req, res, next) => {
    let { family, inventory, page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;
    try {
      const results = await filterItemAssociations(inventory, family, page, perPage);

      for (const item of results[0].result) {
        if (item.images) {
          item.images = item.images.map((_) => {
            return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
          });
        }
      }
      res.send({ success: true, data: results[0] });
    } catch (error) {
      next(error);
    }
  },
  putItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { putQuantity, subLevel, usageReason, job } = req.body;
      if (!(putQuantity && putQuantity > 0) || !(subLevel && mongoose.isValidObjectId(subLevel))) {
        res.status(400).send("Invalid value for putQuantity/subLevel");
        return;
      }

      const subLevelObj = await Sublevel.findById(subLevel);
      let itemAssociation = await ItemAssociation.findOne({ item_id: item._id, sub_level_id: subLevelObj._id });
      if (!itemAssociation) {
        itemAssociation = await ItemAssociation.create({ item_id: item._id, sub_level_id: subLevelObj._id });
      }
      itemAssociation.totalQuantity = itemAssociation.totalQuantity + putQuantity;
      itemAssociation.availableQuantity = itemAssociation.availableQuantity + putQuantity;
      await itemAssociation.save();

      const itemTransaction = await PutItemTransaction.create({
        type: "PUT",
        performedOn: item,
        performedBy: res.locals.user,
        putQuantity: putQuantity,
        subLevel: subLevelObj,
        usageReason: usageReason ? usageReason : "",
        job: job,
      });
      res.send({ success: true, data: { itemAssociation, itemTransaction } });
      res.send({ success: true, data: { itemAssociation, itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  pickItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { pickupQuantity, subLevel, usageReason, job } = req.body;
      if (!(pickupQuantity && pickupQuantity > 0) || !(subLevel && mongoose.isValidObjectId(subLevel))) {
        res.status(400).send("Invalid value for pickupQuantity/subLevel");
        return;
      }

      const subLevelObj = await Sublevel.findById(subLevel);
      let itemAssociation = await ItemAssociation.findOne({ item_id: item._id, sub_level_id: subLevelObj._id });
      if (!itemAssociation) {
        itemAssociation = await ItemAssociation.create({ item_id: item._id, sub_level_id: subLevelObj._id });
      }
      itemAssociation.totalQuantity = itemAssociation.totalQuantity - pickupQuantity;
      itemAssociation.availableQuantity = itemAssociation.availableQuantity - pickupQuantity;
      await itemAssociation.save();

      const itemTransaction = await PickItemTransaction.create({
        type: "PICK",
        performedOn: item,
        performedBy: res.locals.user,
        pickupQuantity: pickupQuantity,
        subLevel: subLevelObj,
        usageReason: usageReason ? usageReason : "",
        job: job,
      });
      res.send({ success: true, data: { itemAssociation, itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  reserveItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { reserveQuantity, job, pickupDate, usageReason } = req.body;
      if (!(reserveQuantity && reserveQuantity > 0) || !(job && mongoose.isValidObjectId(job))) {
        res.status(400).send("Invalid value for reserveQuantity/job");
        return;
      }

      const itemAssociation = await ItemAssociation.findOne({ item_id: item._id, availableQuantity: { $gte: reserveQuantity } });
      if (!itemAssociation) {
        res.status(500).send({ success: false, error: "Quantity unavailable" });
        return;
      }
      itemAssociation.reservedQuantity = itemAssociation.reservedQuantity + reserveQuantity;
      itemAssociation.availableQuantity = itemAssociation.availableQuantity - reserveQuantity;
      await itemAssociation.save();

      const itemTransaction = await ReserveItemTransaction.create({
        type: "RESERVE",
        performedOn: item,
        performedBy: res.locals.user,
        reserveQuantity: reserveQuantity,
        job: job,
        pickupDate: pickupDate ? Date.parse(pickupDate) : undefined,
        usageReason: usageReason ? usageReason : "",
      });
      res.send({ success: true, data: { itemAssociation, itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  checkInItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { checkInMeterReading, hasIssue, issueDescription, usageReason, job } = req.body;

      const itemTransaction = await CheckInItemTransaction.create({
        type: "CHECK-IN",
        performedOn: item,
        performedBy: res.locals.user,
        checkInMeterReading: checkInMeterReading,
        hasIssue: hasIssue || false,
        issueDescription: hasIssue ? issueDescription : "",
        usageReason: usageReason ? usageReason : "",
        job: job,
      });
      res.send({ success: true, data: { itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  checkOutItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { checkOutMeterReading, usageReason, job } = req.body;

      const itemTransaction = await CheckOutItemTransaction.create({
        type: "CHECK-OUT",
        performedOn: item,
        performedBy: res.locals.user,
        checkOutMeterReading: checkOutMeterReading,
        usageReason: usageReason ? usageReason : "",
        job: job,
      });
      res.send({ success: true, data: { itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  reportItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { reportingFor, details, usageReason, job } = req.body;
      if (!(reportingFor && ReportItemForTypes.includes(reportingFor))) {
        res.status(400).send("Invalid value for checkOutMeterReading/job");
        return;
      }

      const itemTransaction = await ReportItemTransaction.create({
        type: "REPORT",
        performedOn: item,
        performedBy: res.locals.user,
        reportingFor: reportingFor,
        details: details ? details : "",
        usageReason: usageReason ? usageReason : "",
        job: job,
      });
      res.send({ success: true, data: { itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  adjustItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send("Missing/Invalid id param");
        return;
      }

      const item = await Item.findById(id);
      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const { recountedQuantity, damagedQuantity, subLevel, usageReason, job } = req.body;
      if (!(recountedQuantity && recountedQuantity > 0) || !(subLevel && mongoose.isValidObjectId(subLevel))) {
        res.status(400).send("Invalid value for pickupQuantity/subLevel");
        return;
      }

      const subLevelObj = await Sublevel.findById(subLevel);
      const itemAssociation = await ItemAssociation.findOne({ item_id: item._id, sub_level_id: subLevelObj._id });
      const lastRecordedQuantity = itemAssociation.totalQuantity;
      const varianceRecordedInQuantity = itemAssociation.totalQuantity - recountedQuantity;
      const totalAdjustment = varianceRecordedInQuantity + damagedQuantity;
      itemAssociation.totalQuantity = itemAssociation.totalQuantity - totalAdjustment;
      itemAssociation.availableQuantity = itemAssociation.availableQuantity - totalAdjustment;
      await itemAssociation.save();

      const itemTransaction = await AdjustItemTransaction.create({
        type: "ADJUST",
        performedOn: item,
        performedBy: res.locals.user,
        lastRecordedQuantity,
        recountedQuantity,
        varianceRecordedInQuantity,
        damagedQuantity,
        totalAdjustment,
        newAdjustedQuantity: itemAssociation.totalQuantity,
        usageReason: usageReason ? usageReason : "",
        job: job,
      });
      res.send({ success: true, data: { itemAssociation, itemTransaction } });
    } catch (error) {
      next(error);
    }
  },

  addImageToItem: async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "invalid id" });
    }

    const item = await Item.findById(id);
    if (!item) {
      res.status(404).send({ success: false, error: "item not found" });
    }

    const image = req.file;
    const url = await S3.uploadFile(`item/${item._id.toString()}-${Date.now()}-0.${image.originalname.split(".").slice(-1).pop()}`, image.path);
    item.images = item.images || [];
    item.images.push({ url });
    await item.save();
    if (item.images) {
      item.images = item.images.map((_) => {
        return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
      });
    }
    res.send({ success: true, data: item });
  },

  removeImageFromItem: async (req, res, next) => {
    const { id, image_id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).send({ success: false, error: "invalid id" });
    }
    if (!mongoose.isValidObjectId(image_id)) {
      res.status(400).send({ success: false, error: "invalid image_id" });
    }

    const item = await Item.findById(id);
    if (!item) {
      res.status(404).send({ success: false, error: "item not found" });
    }

    item.images = item.images.filter((itemImage) => {
      return itemImage._id.toString() != image_id;
    });

    await item.save();

    if (item.images) {
      item.images = item.images.map((_) => {
        return { _id: _._id, url: S3.generatePresignedUrl(_.url) };
      });
    }
    res.send({ success: true, data: item });
  },
};
