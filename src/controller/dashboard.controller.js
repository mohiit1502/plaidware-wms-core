const mongoose = require("mongoose");

const Warehouse = require("../models/Warehouse");
const Zone = require("../models/Zone");
const Area = require("../models/Area");
const Row = require("../models/Row");
const Bay = require("../models/Bay");
const Level = require("../models/Level");
const Sublevel = require("../models/Sublevel");
const Inventory = require("../models/Inventory");
const Material = require("../models/Material");
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
      areaObj.rows = await createRows(zone.areas, area);
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
      rowObj.bays = await createBays(row.bays, row);
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
      bayObj.levels = await createLevels(bay.levels, bay);
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
    if (level.levels) {
      levelObj.subLevels = await createSublevels(level.subLevels, level);
    }
    levelsArr.push(levelObj);
  }
  return levelsArr;
};

const createSublevels = async (subLevels, level, parent = undefined, depth = 0) => {
  const subLevelsArr = [];
  for (const subLevel of subLevels) {
    const subLevelObj = await Sublevel.create({
      name: subLevel.name,
      type: subLevel.type,
      specs: subLevel.specs,
      main_level_id: level._id,
      current_depth: depth,
      parent_subLevel_id: parent ? parent._id : undefined,
      has_inventory: subLevel.has_inventory,
      inventory: subLevel.inventory,
    });

    if (subLevel.sub_levels) {
      const subSubLevels = await createSublevels(subLevel.sub_levels, level, subLevelObj, depth + 1);

      subLevelObj.sub_levels = subSubLevels.map((_) => {
        return {
          type: _.type,
          depth: _.depth,
          sub_level_id: _._id,
        };
      });

      await subLevelObj.save();
    }

    subLevelsArr.push(subLevelObj);
  }
  return subLevelsArr;
};

const createInventory = async ({ name, type }) => {
  if (!(name && type)) {
    return;
  }

  return await Inventory.create({
    name,
    type,
  });
};

const createItems = async (items, material) => {
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
      material,
    };

    if (Object.values(item).every((_) => _)) {
      const itemObj = await Item.create(item);
      itemsArray.push(itemObj);
    }
  }
  return itemsArray;
};

const createMaterials = async (materials, inventory, parent = undefined) => {
  const materialsData = [];
  for (const { name, family, items } of materials) {
    const material = await Material.create({
      name,
      parent,
      inventory,
    });

    let materialFamily;
    if (family) {
      materialFamily = await createMaterials(family, inventory, material);
    }

    let itemsList;
    if (items) {
      itemsList = await createItems(items, material);
    }

    materialsData.push({
      material,
      family: materialFamily,
      items: itemsList,
    });
  }

  return materialsData;
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
      if (!req.body.warehouse.zones) {
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

      if (req.body.inventory.materials) {
        const materials = await createMaterials(req.body.inventory.materials, inventory);
        if (!materials) {
          res.status(400).send({
            success: false,
            message: "Creation of Materials Failed, invalid/missing params",
          });
          return;
        }

        inventorySchema.inventory.materials = materials;
      }

      res.send({ success: true, data: inventorySchema });
    } catch (error) {
      next(error);
    }
  },
};
