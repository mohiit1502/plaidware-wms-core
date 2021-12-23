const router = require("express").Router();
const controller = require("./user.controller");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post("/:id/updateAccess", controller.updateUserAccessControl);

module.exports = router;
