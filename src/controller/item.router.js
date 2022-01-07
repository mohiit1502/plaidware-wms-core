const router = require("express").Router();
const controller = require("./item.controller");
const { ItemTransactionCheck } = require("./utils/authorize");
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

/**
 * @route /item/:id/pick
 */
router.post("/:id/pick", ItemTransactionCheck, controller.pickItem);

/**
 * @route /item/:id/put
 */
router.post("/:id/put", ItemTransactionCheck, controller.putItem);

/**
 * @route /item/:id/reserve
 */
router.post("/:id/reserve", ItemTransactionCheck, controller.reserveItem);

/**
 * @route /item/:id/check-in
 */
router.post("/:id/check-in", ItemTransactionCheck, controller.checkInItem);

/**
 * @route /item/:id/check-out
 */
router.post("/:id/check-out", ItemTransactionCheck, controller.checkOutItem);

/**
 * @route /item/:id/report
 */
router.post("/:id/report", ItemTransactionCheck, controller.reportItem);

/**
 * @route /item/:id/adjust
 */
router.post("/:id/adjust", ItemTransactionCheck, controller.adjustItem);

module.exports = router;
