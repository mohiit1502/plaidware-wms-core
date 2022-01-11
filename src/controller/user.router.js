const router = require("express").Router();
const controller = require("./user.controller");
const { SuperAdminCheck, AuthenticateMiddleware } = require("./utils/authorize");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);

router.post("/:user/add-access", AuthenticateMiddleware, SuperAdminCheck, controller.addUserAccessControl);
router.post("/:user/remove-access", AuthenticateMiddleware, SuperAdminCheck, controller.removeUserAccessControl);
router.get("/allowed-ui-modules", AuthenticateMiddleware, controller.getUIAccessControl);

router.get("/all", AuthenticateMiddleware, SuperAdminCheck, controller.getAllUsers);
router.get("/:id", AuthenticateMiddleware, SuperAdminCheck, controller.getUserById);
router.post("/create", AuthenticateMiddleware, SuperAdminCheck, controller.createUser);
router.post("/:id", AuthenticateMiddleware, SuperAdminCheck, controller.updateUser);

module.exports = router;
