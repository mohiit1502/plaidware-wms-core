const router = require("express").Router();
const controller = require("./zone.controller");


/**
 * @route /zone/
 */
router.get("/all", controller.getAllZone);

/**
 * @route /zone/:id
 */
router.get("/:id", controller.getZoneByID);

/**
 * @route /zone/
 */
router.post("/", controller.createZone);

/**
 * @route /zone/
 */
router.patch("/:id", controller.updateZoneByID);

module.exports = router;
