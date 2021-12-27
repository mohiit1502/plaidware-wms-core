const router = require("express").Router();
const userRouter = require("./user.router");
const userRoleRouter = require("./userRole.router");
const userPermissionRouter = require("./userPermission.router");
const { AuthenticateMiddleware } = require("./utils/authorize");

const companyRouter = require("./company.router");
const warehouseRouter = require("./warehouse.router");
const zoneRouter = require("./zone.router");
const areaRouter = require("./area.router");
const bayRouter = require("./bay.router");
const rowRouter = require("./row.router");
const levelRouter = require("./level.router");

router.use("/user-role", AuthenticateMiddleware, userRoleRouter);
router.use("/user-permission", AuthenticateMiddleware, userPermissionRouter);
router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/warehouse", warehouseRouter);
router.use("/zone", zoneRouter);
router.use("/area", areaRouter);
router.use("/bay", bayRouter);
router.use("/row", rowRouter);
router.use("/level", levelRouter);


router.get("/", (req, res) => {
  res.send({ success: true, message: "Hello world" });
});

router.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({ success: false, error: `Error: ${err.message}` });
});

module.exports = { router };
