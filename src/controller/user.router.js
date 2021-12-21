const router = require("express").Router();
const controller = require("./user.controller");

router.get("/:id", controller.getUser);

module.exports = router;
