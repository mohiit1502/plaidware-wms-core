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
 * @route /sublevel/:id
 */
router.delete('/:id', controller.deleteSublevel);

/**
 * - delete
 * - add prefered_inventory
 */

module.exports = router;
