const router = require("express").Router();
const controller = require("./company.controller");

/**
 * @route /company/:id
 */
router.get("/:id", controller.getCompanyByID);

/**
 * @route /company/
 */
router.post("/", controller.createCompany);

/**
 * @route /company/
 */
router.patch("/:id", controller.updateCompanyByID);

module.exports = router;
