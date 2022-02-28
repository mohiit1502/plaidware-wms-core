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
router.post("/", upload.any("images"), controller.createWarehouse);

/**
 * @route /warehouse/:id/image
 */
router.post("/:id/image", upload.single("image"), controller.addImageToWarehouse);

/**
 * @route /warehouse/:id/image/:image_id
 */
router.delete("/:id/image/:image_id", controller.removeImageFromWarehouse);


/**
 * @route /warehouse/add-image
 */
router.post("/add-image/:id", upload.single("warehouse-image"), controller.addWarehouseImage);

/**
 * @route /warehouse/
 */
router.patch("/:id", controller.updateWarehouseByID);

module.exports = router;
