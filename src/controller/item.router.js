const router = require("express").Router();
const controller = require("./item.controller");

/**
 * @route /item/
 */
router.post("/", controller.createItem);

/**
 * @route /item/
 */
router.patch("/:id", controller.updateItemByID);

/**
 * @route /item/filter
 */
router.get("/filter", controller.getItemsByFilter);

/**
 * @route /item/:id
 */
router.get("/:id", controller.getItemByID);

module.exports = router;
