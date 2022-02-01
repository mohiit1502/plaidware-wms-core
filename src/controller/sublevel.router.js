const router = require("express").Router();
const controller = require("./sublevel.controller");


/**
 * @route /sublevel/
 */
router.get("/all", controller.getAllSublevel);

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
router.delete("/:id", controller.deleteSublevel);

/**
 * @route /sublevel/add-inventory
 */
router.post("/add-inventory", controller.addInventory);

module.exports = router;
