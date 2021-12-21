const router = require("express").Router();
const userRouter = require("./user.router");

router.use("/user", userRouter);

router.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = { router };
