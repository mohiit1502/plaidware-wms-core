const router = require("express").Router();
const upload = require("../middleware/fileUpload");
const controller = require("./warehouse.controller");

/**
 * @route /warehouse/:id
 */
router.get("/:id", controller.getWarehouseByID);

/**
 * @route /warehouse/
 */
router.post("/", controller.createWarehouse);

/**
 * @route /warehouse/add-image
 */
router.post(
  "/add-image",
  upload.single("warehouse-image"),
  controller.addWarehouseImage
);

/**
 * @route /warehouse/
 */
router.patch("/:id", controller.updateWarehouseByID);

module.exports = router;
