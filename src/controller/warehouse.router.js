const router = require("express").Router();
const upload = require("../middleware/fileUpload");
const controller = require("./warehouse.controller");

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
router.post("/", controller.createWarehouse);

/**
 * @route /warehouse/add-image
 */
router.post("/add-image/:id", upload.single("warehouse-image"), controller.addWarehouseImage);

/**
 * @route /warehouse/
 */
router.patch("/:id", controller.updateWarehouseByID);

module.exports = router;
