const router = require("express").Router();
const controller = require("./item.controller");
const { AuthenticateMiddleware, ItemTransactionCheck } = require("./utils/authorize");
const multer = require("multer");
const upload = multer({ dest: "tmp/uploads/" });

/**
 * @route /item/
 */
router.post("/", upload.any("images"), controller.createItem);

/**
 * @route /item/:id/image
 */
router.post("/:id/image", upload.single("image"), controller.addImageToItem);

/**
 * @route /item/:id/image/:image_id
 */
router.delete("/:id/image/:image_id", controller.removeImageFromItem);

/**
 * @route /item/:id
 */
router.patch("/:id", upload.any("images"), controller.updateItemByID);

/**
 * @route /item/:id
 */
router.delete("/:id", controller.deleteItemByID);

/**
 * @route /item/filter
 */
router.get("/filter", controller.getItemsByFilter);

/**
 * @route /item/filter-association
 */
router.get("/filter-association", controller.getItemAssociationsByFilter);

/**
 * @route /item/:id
 */
router.get("/:id", controller.getItemByID);

/**
 * @route /item/:id/pick
 */
router.post("/:id/pick", AuthenticateMiddleware, ItemTransactionCheck, controller.pickItem);

/**
 * @route /item/:id/put
 */
router.post("/:id/put", AuthenticateMiddleware, ItemTransactionCheck, controller.putItem);

/**
 * @route /item/:id/reserve
 */
router.post("/:id/reserve", AuthenticateMiddleware, ItemTransactionCheck, controller.reserveItem);

/**
 * @route /item/:id/check-in
 */
router.post("/:id/check-in", AuthenticateMiddleware, ItemTransactionCheck, controller.checkInItem);

/**
 * @route /item/:id/check-out
 */
router.post("/:id/check-out", AuthenticateMiddleware, ItemTransactionCheck, controller.checkOutItem);

/**
 * @route /item/:id/report
 */
router.post("/:id/report", AuthenticateMiddleware, ItemTransactionCheck, controller.reportItem);

/**
 * @route /item/:id/adjust
 */
router.post("/:id/adjust", AuthenticateMiddleware, ItemTransactionCheck, controller.adjustItem);

module.exports = router;
