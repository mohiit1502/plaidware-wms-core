const Sublevel = require("../models/Sublevel");
const mongoose = require("mongoose");
const { addSublevelToParent, deleteSubLevelTreeFromRoot, validPositions } = require("./utils/sublevel");
const { SubLevelTypes } = require("../config/constants");

module.exports = {
  /**
   * Gets the sublevel data by `id`
   */
  getSubLevelByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const subLevelData = await Sublevel.findById(id);
      if (!subLevelData) {
        res.status(404);
        return;
      }
      req.send(subLevelData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a sublevel
   */
  createSubLevel: async (req, res, next) => {
    console.log(req.body);
    const { name, type, specs, parent_id, parentIsLevel, positions } = req.body;

    if (!(name && type && parent_id && positions)) {
      res.status(400).send("Missing params param");
      return;
    }

    if (!SubLevelTypes.includes(type)) {
      res.status(400).send("Invalid type");
      return;
    }

    if (!validPositions(positions)) {
      res.status(400).send("Invalid positions");
      return;
    }

    try {
      const parentData = parentIsLevel ? { parent_current_depth: 0, parent_main_level_id: parent_id } : await Sublevel.findById(parent_id);

      const { parent_current_depth, parent_main_level_id } = parentData;

      const sublevelData = new Sublevel({
        name,
        type: type,
        specs,
        main_level_id: parent_main_level_id,
        current_depth: parent_current_depth + 1,
        parent_sublevel_id: mongoose.Types.ObjectId(parent_id),
        preferred_inventory: [],
      });

      await addSublevelToParent({ type, positions, sub_level_id: sublevelData._id.toString() }, parent_id, parentIsLevel);

      await sublevelData.save();
      if (!sublevelData) {
        res.status(404);
        return;
      }
      res.send({ ...sublevelData?._doc, positions });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a sublevels' detail
   */
  updateSubLevelDetailsByID: async (req, res, next) => {
    const { name, type, specs } = req.body;
    const { id } = req.params;

    if (!(name || type || specs)) {
      res.status(400).send("Missing params param");
      return;
    }

    if (type && !SubLevelTypes.includes(type)) {
      res.status(400).send("Invalid type");
      return;
    }

    try {
      const sublevelData = await Sublevel.findById(id);
      if (!sublevelData) {
        res.status(404);
        return;
      }

      if (name) sublevelData.name = name;
      if (type) sublevelData.type = type;
      if (specs) sublevelData.specs = specs;

      const newData = await sublevelData.save();
      req.send(newData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes a sublevel
   */
  deleteSublevel: async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      res.status(404).send("Provide an ID");
    }

    try {
      const deletedSublevels = deleteSubLevelTreeFromRoot(id);
      res.send({ success: deletedSublevels.length, data: { deletedSublevels: deletedSublevels } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Add preferred_inventory to a sublevel
   */
  addInventory: async (req, res, next) => {
    const { id, inventory } = req.body;
    const sublevelData = await Sublevel.findById(id);
    if (!sublevelData) {
      res.status(404);
      return;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (inventory.every((_) => _.hasOwnProperty("id") && _.hasOwnProperty("type"))) {
      res.status(404).send({ success: false, message: "invalid inventory data" });
      return;
    }
    try {
      sublevelData.preferred_inventory.push(...inventory);
      await sublevelData.save();
      res.send({ success: true, data: sublevelData.preferred_inventory });
    } catch (err) {
      next(err);
    }
  },

  getAllSublevel: async (req, res, next) => {
    try {
      const { getAllWithPagination } = require("./utils/pagination");
      const { page, perPage } = req.query;
      const data = await getAllWithPagination(Sublevel, page, perPage);
      res.send({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },

  getSubLevelChildrenByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ success: false, message: "Missing id param" });
      return;
    }

    try {
      const sublevelData = await Sublevel.findById(id).populate({ path: "sub_levels", populate: { path: "sub_level_id" } });
      if (!sublevelData) {
        res.status(404).send({ success: false, message: "not found" });
        return;
      }
      res.send({ success: true, data: sublevelData.sub_levels });
    } catch (error) {
      next(error);
    }
  },
};
