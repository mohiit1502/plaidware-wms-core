const router = require("express").Router();
const userRouter = require("./user.router");
const companyRouter = require("./company.router");
const warehouseRouter = require("./warehouse.router");

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/warehouse", warehouseRouter);

router.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = { router };
