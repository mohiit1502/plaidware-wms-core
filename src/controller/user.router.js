const router = require("express").Router();
const controller = require("./user.controller");
const { AuthenticateMiddleware } = require("../config/auth");
const { SuperAdminCheck } = require("./utils/authorize");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post(
  "/:id/addAccess",
  AuthenticateMiddleware,
  SuperAdminCheck,
  controller.addUserAccessControl
);
router.post(
  "/:id/removeAccess",
  AuthenticateMiddleware,
  SuperAdminCheck,
  controller.removeUserAccessControl
);

module.exports = router;
