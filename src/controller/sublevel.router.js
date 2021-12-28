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
 * @route /sublevel/
 */
router.patch("/:id", controller.updateSubLevelDetailsByID);

module.exports = router;
