const Sublevel = require("../../models/Sublevel");
// const Level = require("../../models/Level");

/**
 * To move a sub level
 * @param {string} sub_level_id The Sublevel to me moved
 * @param {string} parent_sub_or_level_id The Level/Sublevel under which to be moved
 * @returns {{success: boolean, message: string}}
 */
exports.moveSublevel = async (sub_level_id, parent_sub_or_level_id) => {
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
exports.deleteSubLevelTreeFromRoot = async (root_sub_level_id) => {
  let sub_level_ids = [];
  let temp_sub_level_ids = [root_sub_level_id];

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
