const router = require("express").Router();
const controller = require("./warehouse.controller");
const multer = require("multer");
const upload = multer({ dest: "tmp/uploads/" });

/**
 * @route /warehouse/
 */
router.get("/all", controller.getAllWarehouse);

/**
 * @route /warehouse/:id
 */
router.get("/:id", controller.getWarehouseByID);

/**
 * @route /warehouse/:id/zones
 */
router.get("/:id/zones", controller.getWarehouseZonesByID);

/**
 * @route /warehouse/
 */
router.post("/", upload.single("image"), controller.createWarehouse);

/**
 * @route /warehouse/
 */
router.patch("/:id", upload.single("image"), controller.updateWarehouseByID);

module.exports = router;
