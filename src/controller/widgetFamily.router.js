const router = require("express").Router();
const controller = require("./widgetFamily.controller");

/**
 * @route /widgetFamily/
 */
router.post("/", controller.createWidgetFamily);

/**
 * @route /widgetFamily/
 */
router.patch("/:id", controller.updateWidgetFamilyByID);

/**
 * @route /widgetFamily/search-by-inventory
 */
router.get("/search-by-inventory", controller.getWidgetFamilyByInventory);

/**
 * @route /widgetFamily/:id
 */
router.get("/:id", controller.getWidgetFamilyByID);

module.exports = router;
