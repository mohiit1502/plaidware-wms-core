const router = require("express").Router();
const userRouter = require("./user.router");
const companyRouter = require("./company.router");

router.use("/user", userRouter);
router.use("/company", companyRouter);

router.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = { router };
