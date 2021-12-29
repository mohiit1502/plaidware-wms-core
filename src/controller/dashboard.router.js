const router = require("express").Router();
const controller = require("./dashboard.controller");

/**
 * @route /dashboard/create-warehouse-schema
 */
router.post("/create-warehouse-schema", controller.createWarehouseSchema);

/**
 * @route /dashboard/create-inventory-schema
 */
router.post("/create-inventory-schema", controller.createInventorySchema);

module.exports = router;
