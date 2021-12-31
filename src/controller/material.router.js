const router = require("express").Router();
const controller = require("./material.controller");

/**
 * @route /material/
 */
router.post("/", controller.createMaterial);

/**
 * @route /material/
 */
router.patch("/:id", controller.updateMaterialByID);

/**
 * @route /material/search-by-inventory
 */
router.get("/search-by-inventory", controller.getMaterialByInventory);

/**
 * @route /material/:id
 */
router.get("/:id", controller.getMaterialByID);

module.exports = router;
