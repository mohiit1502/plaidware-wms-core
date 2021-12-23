const router = require("express").Router();
const controller = require("./user.controller");
const { AuthenticateMiddleware } = require("../config/authenticator");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post(
  "/:id/addAccess",
  AuthenticateMiddleware,
  controller.addUserAccessControl
);
router.post(
  "/:id/removeAccess",
  AuthenticateMiddleware,
  controller.removeUserAccessControl
);

module.exports = router;
