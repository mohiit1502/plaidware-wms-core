const router = require("express").Router();
const controller = require("./item.controller");

/**
 * @route /item/:id
 */
router.get("/:id", controller.getItemByID);

/**
 * @route /item/
 */
router.post("/", controller.createItem);

/**
 * @route /item/
 */
router.patch("/:id", controller.updateItemByID);

module.exports = router;
