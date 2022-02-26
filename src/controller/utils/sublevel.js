const Sublevel = require("../../models/Sublevel");
const Level = require("../../models/Level");
const { LevelPositions } = require("../../config/constants");

/**
 * To move a sub level
 * @param {string} sub_level_id The Sublevel to me moved
 * @param {string} parent_sub_or_level_id The Level/Sublevel under which to be moved
 * @returns {{success: boolean, message: string}}
 */
const moveSublevel = async (sub_level_id, parent_sub_or_level_id) => {
  /**
   * - Check if depths of parent_sub_level_id and parent_sub_or_level_id are same
   * - Copy and add references
   * - Delete and remove references
   */
  return { success: false, message: "not implemented" };
};

/**
 * To delete a sub level and all corresponding sub levels under it
 * @param {string} root_sub_level_id The root Sublevel ID
 * @returns {string[]} The Sublevel IDs that have been deleted
 */
const deleteSubLevelTreeFromRoot = async (root_sub_level_id) => {
  let sub_level_ids = [];
  let temp_sub_level_ids = [root_sub_level_id];

  // remove from parent first
  await removeSublevelFromParent(root_sub_level_id);

  while (temp_sub_level_ids.length > 0) {
    const level_sub_level_data = await Sublevel.find({
      _id: temp_sub_level_ids,
    });

    sub_level_ids = [...sub_level_ids, ...temp_sub_level_ids];
    temp_sub_level_ids = [];

    level_sub_level_data.forEach((sub_level_data) => {
      sub_level_data.sub_levels.forEach((sub_level) => {
        temp_sub_level_ids.push(sub_level.sub_level_id.toString());
      });
    });
  }

  await Sublevel.deleteMany({ _id: sub_level_ids });
  console.log("Deleting sub-level tree", { sub_level_ids });
  return sub_level_ids;
};

/**
 * Add the sublevel data to the parent document
 * @param {{type: string, positions: string[], sub_level_id: string}} payload The sublevel data
 * @param {string} parent_id The parent level ID
 * @param {boolean} parentIsLevel Is parent a level?
 */
const addSublevelToParent = async (payload, parent_id, parentIsLevel) => {
  if (parentIsLevel) {
    // add sublevel to parent
    const parentData = await Level.findById(parent_id);
    parentData.sub_levels.push(payload);
    return await parentData.save();
  } else {
    // add sublevel to sublevel
    const parentData = await Sublevel.findById(parent_id);
    parentData.sub_levels.push(payload);
    return await parentData.save();
  }
};

const removeSublevelFromParent = async (id) => {
  const { main_level_id, parent_sublevel_id, current_depth } = await Sublevel.findById(id);
  if (current_depth == 1) {
    // it means parent is level
    const parentData = await Level.findById(main_level_id);
    parentData.sub_levels = parentData.sub_levels.filter((sub_level) => sub_level.sub_level_id != id);
  } else {
    // parent is another sublevel
    const parentData = await Sublevel.findById(parent_sublevel_id);
    parentData.sub_levels = parentData.sub_levels.filter((sub_level) => sub_level.sub_level_id != id);
  }
};

/**
 * Provides a list of available positions at the particular Level/Sublevel
 * @param {object} sublevelData Level / Sublevel mongoose document
 * @returns {string[]} The list of available positions
 */
const findAvailablePositions = (sublevelData) => {
  let positionsOccupied = [];
  sublevelData.sub_levels.forEach((sublevel) => {
    positionsOccupied = [...positionsOccupied, ...sublevel.sub_levels];
  });
  return LevelPositions.filter((pos) => !positionsOccupied.includes(pos));
};

/**
 * Check if positions are valid positions
 * @param {string[]} positions An array of positions
 * @returns {boolean}
 */
const validPositions = (positions) => {
  return positions.every((position) => LevelPositions.includes(position));
};

module.exports = {
  addSublevelToParent,
  removeSublevelFromParent,
  deleteSubLevelTreeFromRoot,
  moveSublevel,
  findAvailablePositions,
  validPositions,
};
