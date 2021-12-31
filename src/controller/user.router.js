const router = require("express").Router();
const controller = require("./user.controller");
const { SuperAdminCheck, AuthenticateMiddleware } = require("./utils/authorize");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post("/:user/add-access", AuthenticateMiddleware, SuperAdminCheck, controller.addUserAccessControl);
router.post("/:user/remove-access", AuthenticateMiddleware, SuperAdminCheck, controller.removeUserAccessControl);

module.exports = router;
