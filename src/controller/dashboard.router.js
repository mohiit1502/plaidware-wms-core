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

/**
 * @route /dashboard/get-children-from-parent
 */
router.post("/get-children-from-parent", controller.getChildrenFromParent);

/**
 * @route /dashboard/location
 */
router.post("/delete-location", controller.deleteByIdAndLocationType);

module.exports = router;
