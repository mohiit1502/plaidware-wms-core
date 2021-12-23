const router = require("express").Router();
const controller = require("./userRole.controller");

router.get("/all", controller.getAllRoles);
router.get("/:id", controller.getRole);
router.post("/create", controller.createRole);
router.patch("/:id", controller.updateRole);
router.delete("/:id", controller.deleteRole);

module.exports = router;
