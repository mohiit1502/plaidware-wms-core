const router = require("express").Router();
const controller = require("./area.controller");

/**
 * @route /area/
 */
router.get("/all", controller.getAllArea);

/**
 * @route /area/:id
 */
router.get("/:id", controller.getAreaByID);

/**
 * @route /area/
 */
router.post("/", controller.createArea);

/**
 * @route /area/
 */
router.patch("/:id", controller.updateAreaByID);

module.exports = router;
