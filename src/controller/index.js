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
const sublevelRouter = require("./sublevel.router");
const dashboardRouter = require("./dashboard.router");
const inventoryRouter = require("./inventory.router");
const materialRouter = require("./material.router");
const itemRouter = require("./item.router");

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
router.use("/sublevel", sublevelRouter);
router.use("/dashboard", dashboardRouter);
router.use("/inventory", inventoryRouter);
router.use("/material", materialRouter);
router.use("/item", itemRouter);

router.get("/", (req, res) => {
  res.send({ success: true, message: "Hello world" });
});

router.use(function (err, req, res, next) {
  console.error(err.message, err.stack);
  res.status(500).send({ success: false, error: `Error: ${err.message}` });
});

module.exports = { router };
