const Sublevel = require("../../models/Sublevel");
const Level = require("../../models/Level");

// exports.moveSublevel = async (sub_level_id, under_sub_or_level_id, isMainLevel) => {
  
// };

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
