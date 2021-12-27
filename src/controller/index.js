const router = require("express").Router();
const userRouter = require("./user.router");
const companyRouter = require("./company.router");
const warehouseRouter = require("./warehouse.router");
const zoneRouter = require("./zone.router");
const areaRouter = require("./area.router");
const bayRouter = require("./bay.router");
const rowRouter = require("./row.router");
const levelRouter = require("./level.router");

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/warehouse", warehouseRouter);
router.use("/zone", zoneRouter);
router.use("/area", areaRouter);
router.use("/bay", bayRouter);
router.use("/row", rowRouter);
router.use("/level", levelRouter);

router.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = { router };
