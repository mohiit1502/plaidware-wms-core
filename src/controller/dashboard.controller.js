const mongoose = require("mongoose");

const Warehouse = require("../models/Warehouse");
const Zone = require("../models/Zone");
const Area = require("../models/Area");
const Row = require("../models/Row");
const Bay = require("../models/Bay");
const Level = require("../models/Level");
const Sublevel = require("../models/Sublevel");
const Inventory = require("../models/Inventory");
const WidgetFamily = require("../models/WidgetFamily");
const Item = require("../models/Item");

const createWarehouse = async ({ name, address, specs, company_id }) => {
  if (!(name && address)) {
    return;
  }

  return await Warehouse.create({
    name,
    address,
    specs,
    company_id: mongoose.Types.ObjectId(company_id),
  });
};

const createZones = async (zones, warehouse) => {
  const zonesArr = [];
  for (const zone of zones) {
    const { name, type, specs } = zone;

    const zoneObj = new Zone({
      name,
      type,
      specs,
      warehouse_id: mongoose.Types.ObjectId(warehouse._id),
    });

    await zoneObj.save();

    if (zone.areas) {
      zoneObj.areas = await createAreas(zone.areas, zoneObj);
    }

    zonesArr.push(zoneObj);
  }
  return zonesArr;
};

const createAreas = async (areas, zone) => {
  const areasArr = [];
  for (const area of areas) {
    const { name, type, specs } = area;
    const areaObj = new Area({
      name,
      type,
      specs,
      zone_id: mongoose.Types.ObjectId(zone._id),
    });

    await areaObj.save();
    if (area.rows) {
      areaObj.rows = await createRows(area.rows, areaObj);
    }
    areasArr.push(areaObj);
  }
  return areasArr;
};

const createRows = async (rows, area) => {
  const rowsArr = [];
  for (const row of rows) {
    const { name, number, specs } = row;
    const rowObj = new Row({
      name,
      number: parseInt(number),
      specs,
      area_id: mongoose.Types.ObjectId(area._id),
    });

    await rowObj.save();
    if (row.bays) {
      rowObj.bays = await createBays(row.bays, rowObj);
    }
    rowsArr.push(rowObj);
  }
  return rowsArr;
};

const createBays = async (bays, row) => {
  const baysArr = [];
  for (const bay of bays) {
    const { name, number, type, specs } = bay;
    const bayObj = new Bay({
      name,
      number: parseInt(number),
      type,
      specs,
      row_id: mongoose.Types.ObjectId(row._id),
    });

    await bayObj.save();
    if (bay.levels) {
      bayObj.levels = await createLevels(bay.levels, bayObj);
    }
    baysArr.push(bayObj);
  }
  return baysArr;
};

const createLevels = async (levels, bay) => {
  const levelsArr = [];
  for (const level of levels) {
    const { name, number, specs } = level;
    const levelObj = new Level({
      name,
      number: parseInt(number),
      specs,
      row_id: mongoose.Types.ObjectId(bay._id),
    });

    await levelObj.save();
    if (level.subLevels) {
      levelObj.sub_levels = await createSublevels(level.subLevels, levelObj);
    }
    levelsArr.push(levelObj);
  }
  return levelsArr;
};

const createSublevels = async (subLevels, level, parent = undefined, depth = 0) => {
  const sub_levels_list = [];
  for (const subLevel of subLevels) {
    const subLevelObj = await Sublevel.create({
      name: subLevel.name,
      type: subLevel.type,
      specs: subLevel.specs,
      main_level_id: level._id,
      current_depth: depth,
      parent_sublevel_id: parent ? parent._id : undefined,
      has_inventory: subLevel.has_inventory,
      preferred_inventory: subLevel.preferred_inventory,
    });

    const sub_levels = {
      positions: subLevel.positions,
      type: subLevel.type,
      sub_level_id: subLevelObj._id,
    };
    sub_levels_list.push(sub_levels);

    if (depth > 0 && parent) {
      parent.sub_levels = parent.sub_levels.concat(sub_levels);

      await parent.save();
    }

    if (subLevel.sub_levels) {
      subLevelObj.sub_levels = await createSublevels(subLevel.sub_levels, level, subLevelObj, depth + 1);
      await subLevelObj.save();
    }
  }
  return sub_levels_list;
};

const createInventory = async ({ name, type, policies }) => {
  if (!(name && type)) {
    return;
  }

  const preferredLocations = [];
  if (policies.preferredLocations && Array.isArray(policies.preferredLocations)) {
    for (const preferredLocation of policies.preferredLocations) {
      preferredLocations.push({ id: preferredLocation.id, type: preferredLocation.type });
    }
  }

  const verifiedPolicies = {
    orderTracking: policies.orderTracking || {},
    alerting: {
      lowestStockLevel: policies.alerting && policies.alerting.lowestStockLevel ? policies.alerting.lowestStockLevel : false,
      highestStockLevel: policies.alerting && policies.alerting.highestStockLevel ? policies.alerting.highestStockLevel : false,
      alertStockLevel: policies.alerting && policies.alerting.alertStockLevel ? policies.alerting.alertStockLevel : false,
      reOrderLevel: policies.alerting && policies.alerting.reOrderLevel ? policies.alerting.reOrderLevel : false,
    },
    replenishment: policies.replenishment || {},
    preferredLocations: preferredLocations,
  };

  return await Inventory.create({
    name,
    type,
    policies: verifiedPolicies,
  });
};

const createItems = async (items, widgetFamily) => {
  const itemsArray = [];
  for (const itemData of items) {
    const item = {
      commonName: itemData.commonName,
      formalName: itemData.formalName,
      description: itemData.description,
      manufacturer: itemData.manufacturer,
      size: itemData.size,
      color: itemData.color,
      type: itemData.type,
      unitOfMaterial: itemData.unitOfMaterial,
      unitCost: itemData.unitCost,
      packageCount: itemData.packageCount,
      countPerPallet: itemData.countPerPallet,
      countPerPalletPackage: itemData.countPerPalletPackage,
      customAttributes: itemData.customAttributes,
      widgetFamily,
    };

    if (Object.values(item).every((_) => _)) {
      const itemObj = await Item.create(item);
      itemsArray.push(itemObj);
    }
  }
  return itemsArray;
};

const createWidgetFamilies = async (widgetFamilies, inventory, parent = undefined) => {
  const widgetFamiliesData = [];
  for (const { name, family, items } of widgetFamilies) {
    const widgetFamily = await WidgetFamily.create({
      name,
      parent,
      inventory,
    });

    let widgetFamilyFamily;
    if (family) {
      widgetFamilyFamily = await createWidgetFamilies(family, inventory, widgetFamily);
    }

    let itemsList;
    if (items) {
      itemsList = await createItems(items, widgetFamily);
    }

    widgetFamiliesData.push({
      widgetFamily,
      family: widgetFamilyFamily,
      items: itemsList,
    });
  }

  return widgetFamiliesData;
};

const getChildModel = (parentType) => {
  switch (parentType) {
    case "warehouse":
      return Zone;
    case "zone":
      return Area;
    case "area":
      return Row;
    case "row":
      return Bay;
    case "bay":
      return Level;
    case "level":
      return Sublevel;
    case "sublevel":
      return Sublevel;
    default:
      throw new Error("Invalid model type");
  }
};

module.exports = {
  createWarehouseSchema: async (req, res, next) => {
    try {
      const warehouseSchema = {};
      if (!req.body.warehouse) {
        res.status(400).send({
          success: false,
          message: "Creation of Warehouse Failed, missing params",
        });
        return;
      }

      const warehouse = await createWarehouse(req.body.warehouse);
      if (!warehouse) {
        res.status(400).send({
          success: false,
          message: "Creation of Warehouse Failed, invalid/missing params",
        });
        return;
      }

      warehouseSchema.warehouse = warehouse;
      if (req.body.warehouse.zones !== undefined && Array.isArray(req.body.warehouse.zones)) {
        const zones = await createZones(req.body.warehouse.zones, warehouse);
        if (!zones) {
          res.status(400).send({
            success: false,
            message: "Creation of Zones Failed, invalid/missing params",
          });
          return;
        }

        warehouseSchema.warehouse.zones = zones;
      }
      res.send({ success: true, data: warehouseSchema });
    } catch (error) {
      next(error);
    }
  },
  createInventorySchema: async (req, res, next) => {
    try {
      const inventorySchema = {};
      if (!req.body.inventory) {
        res.status(400).send({
          success: false,
          message: "Creation of Inventory Failed, missing params",
        });
        return;
      }

      const inventory = await createInventory(req.body.inventory);

      if (!inventory) {
        res.status(400).send({
          success: false,
          message: "Creation of Inventory Failed, invalid/missing params",
        });
        return;
      }
      inventorySchema.inventory = inventory.toObject();

      if (req.body.inventory.widgetFamilies) {
        const widgetFamilies = await createWidgetFamilies(req.body.inventory.widgetFamilies, inventory);
        if (!widgetFamilies) {
          res.status(400).send({
            success: false,
            message: "Creation of WidgetFamilies Failed, invalid/missing params",
          });
          return;
        }

        inventorySchema.inventory.widgetFamilies = widgetFamilies;
      }

      res.send({ success: true, data: inventorySchema });
    } catch (error) {
      next(error);
    }
  },
  getChildrenFromParent: async (req, res, next) => {
    try {
      const { id, type } = req.body;
      if (!id || !type) return res.send({ success: false, message: "Missing id or type" });

      let query = {};

      switch (type) {
        case "level":
        case "sublevel":
          query = { $or: [{ main_level_id: id, parent_sublevel_id: id }] };
          break;

        default:
          query[`${type}_id`] = id;
          break;
      }

      let childrenData = await getChildModel(type).find(query);

      // populate locations to sublevel
      if (childrenData && ["level", "sublevel"].includes(type)) {
        const parentData = type === "level" ? await Level.findById(id) : await Sublevel.findById(id);
        childrenData =
          parentData && childrenData.map((t1) => ({ ...t1, positions: parentData.sub_levels?.find((t2) => t2.sub_level_id === t1._id)?.positions }));
      }

      res.send({ success: true, data: { parent: { id, type }, childrenData } });
    } catch (error) {
      next(error);
    }
  },
};
