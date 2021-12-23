const router = require("express").Router();
const userRouter = require("./user.router");
const userRoleRouter = require("./userRole.router");
const userPermissionRouter = require("./userPermission.router");
const { AuthenticateMiddleware } = require("../config/auth");

router.use("/user", userRouter);
router.use("/user-role", AuthenticateMiddleware, userRoleRouter);
router.use("/user-permission", AuthenticateMiddleware, userPermissionRouter);

router.get("/", (req, res) => {
  res.send({ success: true, message: "Hello world" });
});

router.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({ error: `Error: ${err.message}` });
});

module.exports = { router };
