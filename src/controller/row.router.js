const router = require("express").Router();
const controller = require("./row.controller");


/**
 * @route /row/
 */
router.get("/all", controller.getAllRow);

/**
 * @route /row/:id
 */
router.get("/:id", controller.getRowByID);

/**
 * @route /row/
 */
router.post("/", controller.createRow);

/**
 * @route /row/
 */
router.patch("/:id", controller.updateRowByID);

module.exports = router;
