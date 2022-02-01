const router = require("express").Router();
const controller = require("./level.controller");


/**
 * @route /level/
 */
router.get("/all", controller.getAllLevel);

/**
 * @route /level/:id
 */
router.get("/:id", controller.getLevelByID);

/**
 * @route /level/
 */
router.post("/", controller.createLevel);

/**
 * @route /level/
 */
router.patch("/:id", controller.updateLevelByID);

module.exports = router;
