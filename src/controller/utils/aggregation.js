const mongoose = require("mongoose");
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

module.exports = {
  filterSublevels: async ({ warehouse, zone, area, row }) => {
    const pipeline = sublevelFilterAggregationPipeline(warehouse, zone, area, row);
    return await Warehouse.aggregate(pipeline);
  },
};
