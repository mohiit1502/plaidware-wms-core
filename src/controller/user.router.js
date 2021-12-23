const router = require("express").Router();
const controller = require("./user.controller");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post("/:id/addAccess", controller.addUserAccessControl);
router.post("/:id/removeAccess", controller.removeUserAccessControl);

module.exports = router;
