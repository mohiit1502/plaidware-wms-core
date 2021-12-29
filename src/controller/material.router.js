const router = require("express").Router();
const controller = require("./material.controller");

/**
 * @route /material/:id
 */
router.get("/:id", controller.getMaterialByID);

/**
 * @route /material/
 */
router.post("/", controller.createMaterial);

/**
 * @route /material/
 */
router.patch("/:id", controller.updateMaterialByID);

module.exports = router;
