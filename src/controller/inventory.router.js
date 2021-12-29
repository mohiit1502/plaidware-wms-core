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

module.exports = router;
