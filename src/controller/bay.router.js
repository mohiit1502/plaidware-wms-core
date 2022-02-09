const router = require("express").Router();
const controller = require("./bay.controller");


/**
 * @route /bay/
 */
router.get("/all", controller.getAllBay);

/**
 * @route /bay/:id
 */
router.get("/:id", controller.getBayByID);

/**
 * @route /bay/:id/levels
 */
router.get("/:id/levels", controller.getBayLevelsByID);

/**
 * @route /bay/
 */
router.post("/", controller.createBay);

/**
 * @route /bay/
 */
router.patch("/:id", controller.updateBayByID);

module.exports = router;
