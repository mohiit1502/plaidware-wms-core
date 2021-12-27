const router = require("express").Router();
const controller = require("./bay.controller");

/**
 * @route /bay/:id
 */
router.get("/:id", controller.getBayByID);

/**
 * @route /bay/
 */
router.post("/", controller.createBay);

/**
 * @route /bay/
 */
router.patch("/:id", controller.updateBayByID);

module.exports = router;
