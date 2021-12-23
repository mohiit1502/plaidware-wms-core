const router = require("express").Router();
const controller = require("./userPermission.controller");

router.get("/all", controller.getAllPermissions);
router.get("/:id", controller.getPermission);
router.post("/create", controller.createPermission);
router.post("/:id", controller.updatePermission);
router.delete("/:id", controller.deletePermission);

module.exports = router;
