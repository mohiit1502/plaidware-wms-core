const router = require("express").Router();
const controller = require("./sublevel.controller");

/**
 * @route /sublevel/:id
 */
router.get("/:id", controller.getSubLevelByID);

/**
 * @route /sublevel/
 */
router.post("/", controller.createSubLevel);

/**
 * @route /sublevel/:id
 */
router.patch("/:id", controller.updateSubLevelDetailsByID);

/**
 * - delete
 * - add prefered_inventory
 */

module.exports = router;
