const router = require("express").Router();
const controller = require("./inventory.controller");
const multer = require("multer");
const upload = multer({ dest: "tmp/uploads/" });
/**
 * @route /inventory/
 */
router.post("/", upload.single("image"), controller.createInventory);

/**
 * @route /inventory/
 */
router.patch("/:id", upload.single("image"), controller.updateInventoryByID);

/**
 * @route /inventory/types
 */
router.get("/types", controller.getInventoryTypes);

/**
 * @route /inventory/all
 */
router.get("/all", controller.getInventories);

/**
 * @route /inventory/filter-by-type
 */
router.get("/filter-by-type", controller.getInventoryByType);

/**
 * @route /inventory/all
 */
router.get("/all", controller.getInventories);

/**
 * @route /inventory/:id
 */
router.get("/:id", controller.getInventoryByID);

/**
 * @route /inventory/:id
 */
router.delete("/:id", controller.deleteInventoryByID);

module.exports = router;
