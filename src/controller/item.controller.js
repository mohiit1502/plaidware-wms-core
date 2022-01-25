const mongoose = require("mongoose");
const Item = require("../models/Item");
const WidgetFamily = require("../models/WidgetFamily");
const Inventory = require("../models/Inventory");
const {
  PickItemTransaction,
  PutItemTransaction,
  ReserveItemTransaction,
  CheckInItemTransaction,
  CheckOutItemTransaction,
  ReportItemTransaction,
  AdjustItemTransaction,
} = require("../models/ItemTransaction");

const ItemAssociation = require("../models/ItemAssociation");
const Sublevel = require("../models/Sublevel");
const { InventoryTypes, ReportItemForTypes } = require("../config/constants");

module.exports = {
  /**
   * Gets the Item data by `id`
   */
  getItemByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const itemData = await Item.findById(id);
      if (!itemData) {
        res.status(404);
        return;
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
    };

    for (const key of Object.keys(item)) {
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

      await itemData.save();
      res.send({ success: true, data: itemData });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gets the Items data by filter
   */
  getItemsByFilter: async (req, res, next) => {
    let { family, type, inventory, page, perPage } = req.query;
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;
    const inventoryFilters = {};
    let inventories;
    let widgetFamilies;
    let itemFilters;
    try {
      if (type && InventoryTypes.includes(type)) {
        inventoryFilters["type"] = type;
      }

      if (inventory) {
        inventoryFilters["_id"] = inventory;
      }

      if (Object.keys(inventoryFilters).length > 0) {
        inventories = await Inventory.find(inventoryFilters);
      }

      const widgetFamilyFilters = [];
      if (inventories) {
        widgetFamilyFilters.push({
          inventory: { $in: inventories.map((_) => _._id) },
        });
      }

      if (family) {
        widgetFamilyFilters.push({
          name: family,
        });
      }
      if (widgetFamilyFilters.length > 0) {
        widgetFamilies = await WidgetFamily.find({
          $or: widgetFamilyFilters,
        });
      }

      if (widgetFamilies) {
        itemFilters = { widgetFamily: { $in: widgetFamilies.map((_) => _._id) } };
      } else {
        itemFilters = {};
      }
      const itemData = await Item.find(
        itemFilters,
        {
          id: 1,
          commonName: 1,
          formalName: 1,
          description: 1,
          manufacturer: 1,
          widgetFamily: 1,
          size: 1,
          color: 1,
          type: 1,
          unitOfMaterial: 1,
          unitCost: 1,
          packageCount: 1,
          countPerPallet: 1,
          countPerPalletPackage: 1,
          customAttributes: 1,
        },
        { skip: page * perPage, limit: perPage }
      ).populate({ path: "widgetFamily" });
      if (!itemData) {
        res.status(404);
        return;
      }
      res.send({ success: true, data: itemData });
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

      const { putQuantity, subLevel } = req.body;
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

      const { pickupQuantity, subLevel } = req.body;
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

      const { reserveQuantity, job, pickupDate } = req.body;
      if (!(reserveQuantity && reserveQuantity > 0) || !(job && mongoose.isValidObjectId(job)) || !(pickupDate && Date.parse(pickupDate))) {
        res.status(400).send("Invalid value for reserveQuantity/job/pickupDate");
        return;
      }

      const itemAssociation = await ItemAssociation.findOne({ item_id: item._id, availableQuantity: { $gte: reserveQuantity } });
      if (!itemAssociation) {
        res.status(500).send("Quantity unavailable");
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
        pickupDate: Date.parse(pickupDate),
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

      const { checkInMeterReading, hasIssue, issueDescription } = req.body;
      if (!(checkInMeterReading && checkInMeterReading > 0)) {
        res.status(400).send("Invalid value for checkInMeterReading");
        return;
      }

      const itemTransaction = await CheckInItemTransaction.create({
        type: "CHECK-IN",
        performedOn: item,
        performedBy: res.locals.user,
        checkInMeterReading: checkInMeterReading,
        hasIssue: hasIssue,
        issueDescription: hasIssue ? issueDescription : "",
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

      const { checkOutMeterReading, job, usageReason } = req.body;
      if (!(checkOutMeterReading && checkOutMeterReading > 0) || !(job && mongoose.isValidObjectId(job))) {
        res.status(400).send("Invalid value for checkOutMeterReading/job");
        return;
      }

      const itemTransaction = await CheckOutItemTransaction.create({
        type: "CHECK-OUT",
        performedOn: item,
        performedBy: res.locals.user,
        checkOutMeterReading: checkOutMeterReading,
        job: job,
        usageReason: usageReason ? usageReason : "",
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

      const { reportingFor, details } = req.body;
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

      const { recountedQuantity, damagedQuantity, subLevel } = req.body;
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
      });
      res.send({ success: true, data: { itemAssociation, itemTransaction } });
    } catch (error) {
      next(error);
    }
  },
};
