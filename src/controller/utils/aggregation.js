const mongoose = require("mongoose");
const Item = require("../../models/Item");
const Warehouse = require("./../../models/Warehouse");

const lookupPipeline = (from, localField, foreignField, as) => {
  return {
    $lookup: {
      from,
      localField,
      foreignField,
      as,
    },
  };
};

const unwindPipeline = (path, preserveNullAndEmptyArrays = true) => {
  return {
    $unwind: {
      path: "$" + path,
      preserveNullAndEmptyArrays,
    },
  };
};

const sublevelFilterAggregationPipeline = (warehouse, zone, area, row) => {
  const sublevelFilterAggregationPipeline = [];
  if (warehouse && mongoose.isValidObjectId(warehouse)) {
    sublevelFilterAggregationPipeline.push({
      $match: {
        _id: mongoose.Types.ObjectId(warehouse),
      },
    });
  }

  sublevelFilterAggregationPipeline.push(lookupPipeline("zones", "_id", "warehouse_id", "zone"));
  sublevelFilterAggregationPipeline.push(unwindPipeline("zone"));
  if (warehouse && zone && mongoose.isValidObjectId(zone)) {
    sublevelFilterAggregationPipeline.push({
      $match: {
        "zone._id": mongoose.Types.ObjectId(zone),
      },
    });
  }

  sublevelFilterAggregationPipeline.push(lookupPipeline("areas", "zone._id", "zone_id", "area"));
  sublevelFilterAggregationPipeline.push(unwindPipeline("area"));
  if (warehouse && zone && area && mongoose.isValidObjectId(area)) {
    sublevelFilterAggregationPipeline.push({
      $match: {
        "area._id": mongoose.Types.ObjectId(area),
      },
    });
  }

  sublevelFilterAggregationPipeline.push(lookupPipeline("rows", "area._id", "area_id", "row"));
  sublevelFilterAggregationPipeline.push(unwindPipeline("row"));
  if (warehouse && zone && area && row && mongoose.isValidObjectId(row)) {
    sublevelFilterAggregationPipeline.push({
      $match: {
        "row._id": mongoose.Types.ObjectId(row),
      },
    });
  }

  sublevelFilterAggregationPipeline.push(lookupPipeline("bays", "row._id", "row_id", "bay"));
  sublevelFilterAggregationPipeline.push(unwindPipeline("bay"));
  sublevelFilterAggregationPipeline.push(lookupPipeline("levels", "bay._id", "bay_id", "level"));
  sublevelFilterAggregationPipeline.push(unwindPipeline("level"));
  sublevelFilterAggregationPipeline.push(lookupPipeline("sublevels", "level._id", "main_level_id", "sublevel1"));
  sublevelFilterAggregationPipeline.push(unwindPipeline("sublevel1"));
  // sublevelFilterAggregationPipeline.push(lookupPipeline("sublevels", "sublevel1._id", "parent_id", "sublevel2"));
  // sublevelFilterAggregationPipeline.push(unwindPipeline("sublevel2", false));
  // sublevelFilterAggregationPipeline.push(lookupPipeline("sublevels", "sublevel2._id", "parent_id", "sublevel3"));
  // sublevelFilterAggregationPipeline.push(unwindPipeline("sublevel3", false));
  return sublevelFilterAggregationPipeline;
};

const itemAssociationFilterAggregationPipeline = (inventory, widgetFamily, page, perPage, showAllItems) => {
  const itemFilterAggregationPipeline = [];
  itemFilterAggregationPipeline.push(lookupPipeline("widgetfamilies", "widgetFamily", "_id", "widgetfamily"));
  itemFilterAggregationPipeline.push(unwindPipeline("widgetfamily"));
  const matchQuery = {};
  if (inventory) {
    matchQuery["widgetfamily.inventory"] = mongoose.Types.ObjectId(inventory);
  }
  if (widgetFamily) {
    matchQuery["widgetfamily._id"] = mongoose.Types.ObjectId(widgetFamily);
  }
  if (Object.values(matchQuery).length > 0) {
    itemFilterAggregationPipeline.push({
      $match: matchQuery,
    });
  }
  itemFilterAggregationPipeline.push(lookupPipeline("inventories", "widgetfamily.inventory", "_id", "inventory"));
  itemFilterAggregationPipeline.push(unwindPipeline("inventory"));
  itemFilterAggregationPipeline.push(lookupPipeline("itemassociations", "_id", "item_id", "association"));
  itemFilterAggregationPipeline.push(unwindPipeline("association", false));
  itemFilterAggregationPipeline.push(lookupPipeline("sublevels", "association.sub_level_id", "_id", "location"));
  itemFilterAggregationPipeline.push(unwindPipeline("location"));
  itemFilterAggregationPipeline.push({
    $project: {
      _id: 1,
      commonName: 1,
      formalName: 1,
      description: 1,
      manufacturer: 1,
      size: 1,
      color: 1,
      type: 1,
      unitOfMaterial: 1,
      unitCost: 1,
      packageCount: 1,
      countPerPallet: 1,
      countPerPalletPackage: 1,
      customAttributes: 1,
      policiesMetadata: 1,
      createdAt: 1,
      updatedAt: 1,
      images: 1,
      widgetfamily: 1,
      inventory: 1,
      location: 1,
      totalQuantity: "$association.totalQuantity",
      reservedQuantity: "$association.reservedQuantity",
      availableQuantity: "$association.availableQuantity",
    },
  });
  itemFilterAggregationPipeline.push({
    $facet: {
      result: [
        {
          $skip: page * perPage,
        },
        {
          $limit: perPage,
        },
      ],
      count: [
        {
          $count: "Total",
        },
      ],
    },
  });
  itemFilterAggregationPipeline.push({
    $project: {
      result: 1,
      count: {
        $first: "$count.Total",
      },
    },
  });
  return itemFilterAggregationPipeline;
};

const itemFilterAggregationPipeline = (inventory, widgetFamily, page, perPage, showAllItems) => {
  const itemFilterAggregationPipeline = [];
  itemFilterAggregationPipeline.push(lookupPipeline("widgetfamilies", "widgetFamily", "_id", "widgetfamily"));
  itemFilterAggregationPipeline.push(unwindPipeline("widgetfamily"));
  const matchQuery = {};
  if (inventory) {
    matchQuery["widgetfamily.inventory"] = mongoose.Types.ObjectId(inventory);
  }
  if (widgetFamily) {
    matchQuery["widgetfamily._id"] = mongoose.Types.ObjectId(widgetFamily);
  }
  if (Object.values(matchQuery).length > 0) {
    itemFilterAggregationPipeline.push({
      $match: matchQuery,
    });
  }
  itemFilterAggregationPipeline.push(lookupPipeline("inventories", "widgetfamily.inventory", "_id", "inventory"));
  itemFilterAggregationPipeline.push(unwindPipeline("inventory"));
  itemFilterAggregationPipeline.push({
    $project: {
      _id: 1,
      commonName: 1,
      formalName: 1,
      description: 1,
      manufacturer: 1,
      size: 1,
      color: 1,
      type: 1,
      unitOfMaterial: 1,
      unitCost: 1,
      packageCount: 1,
      countPerPallet: 1,
      countPerPalletPackage: 1,
      customAttributes: 1,
      policiesMetadata: 1,
      createdAt: 1,
      updatedAt: 1,
      images: 1,
      widgetfamily: 1,
      inventory: 1,
    },
  });
  itemFilterAggregationPipeline.push({
    $facet: {
      result: [
        {
          $skip: page * perPage,
        },
        {
          $limit: perPage,
        },
      ],
      count: [
        {
          $count: "Total",
        },
      ],
    },
  });
  itemFilterAggregationPipeline.push({
    $project: {
      result: 1,
      count: {
        $first: "$count.Total",
      },
    },
  });
  return itemFilterAggregationPipeline;
};

module.exports = {
  filterSublevels: async ({ warehouse, zone, area, row }) => {
    const pipeline = sublevelFilterAggregationPipeline(warehouse, zone, area, row);
    return await Warehouse.aggregate(pipeline);
  },

  filterItems: async (inventory, widgetFamily, page, perPage, showAllItems) => {
    const pipeline = itemFilterAggregationPipeline(inventory, widgetFamily, page, perPage);
    return await Item.aggregate(pipeline);
  },

  filterItemAssociations: async (inventory, widgetFamily, page, perPage, showAllItems) => {
    const pipeline = itemAssociationFilterAggregationPipeline(inventory, widgetFamily, page, perPage, showAllItems);
    return await Item.aggregate(pipeline);
  },
};
