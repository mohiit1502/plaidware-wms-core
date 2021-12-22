const router = require("express").Router();
const userRouter = require("./user.router");
const companyRouter = require("./company.router");
const warehouseRouter = require("./warehouse.router");
const zoneRouter = require("./zone.router");

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/warehouse", warehouseRouter);
router.use("/zone", zoneRouter);

router.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = { router };
