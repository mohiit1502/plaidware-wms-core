const router = require("express").Router();
const controller = require("./warehouse.controller");

/**
 * @route /warehouse/:id
 */
router.get("/:id", controller.getWarehouseByID);

/**
 * @route /warehouse/
 */
router.post("/", controller.createWarehouse);

/**
 * @route /warehouse/
 */
router.patch("/:id", controller.updateWarehouseByID);

module.exports = router;
