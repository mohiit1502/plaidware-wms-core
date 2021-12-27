const Company = require("../models/Company");

module.exports = {
  /**
   * Gets the company data by `id`
   */
  getCompanyByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    try {
      const companyData = await Company.findById(id);
      if (!companyData) {
        res.status(404);
        return;
      }
      req.send(companyData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a company
   */
  createCompany: async (req, res, next) => {
    const { name, address, contact_info, business_info } = req.body;

    if (!(name && address)) {
      res.status(400).send("Missing params param");
      return;
    }

    try {
      const companyData = new Company({
        name,
        address,
        contact_info,
        business_info,
      });

      await companyData.save();
      if (!companyData) {
        res.status(404);
        return;
      }
      req.send(companyData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a companys detail
   */
  updateCompanyByID: async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).send("Missing id param");
      return;
    }

    const { name, address, contact_info, business_info } = req.body;

    if (!(name || address || contact_info || business_info)) {
      res.status(400).send("Missing data in body");
      return;
    }

    try {
      const companyData = await Company.findById(id);
      if (!companyData) {
        res.status(404);
        return;
      }

      if (name) companyData.name = name;
      if (address) companyData.address = address;
      if (contact_info) companyData.contact_info = contact_info;
      if (business_info) companyData.business_info = business_info;

      await companyData.save();
      req.send(companyData);
    } catch (error) {
      next(error);
    }
  },
};
