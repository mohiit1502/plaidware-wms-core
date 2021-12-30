const router = require("express").Router();
const controller = require("./inventory.controller");

/**
 * @route /inventory/:id
 */
router.get("/:id", controller.getInventoryByID);

/**
 * @route /inventory/
 */
router.post("/", controller.createInventory);

/**
 * @route /inventory/
 */
router.patch("/:id", controller.updateInventoryByID);

/**
 * @route /inventory/filter-by-type
 */
router.get("/filter-by-type", controller.getInventoryByType);

module.exports = router;
