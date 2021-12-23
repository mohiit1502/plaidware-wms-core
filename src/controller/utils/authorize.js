const UserRole = require("../../models/UserRole");
const { AuthorizeUser } = require("../../config/auth");
const { SUPER_ADMIN_ROLE, AUTHORIZATION_FAILURE_ERROR_MESSAGE } = require("../../config/constants");

module.exports = {
  SuperAdminCheck: async (req, res, next) => {
    const SuperAdmin = await UserRole.findOne({ name: SUPER_ADMIN_ROLE });
    if (AuthorizeUser(req.locals.user, [SuperAdmin.id])) {
      next();
    } else {
      res
        .status(403)
        .send({ success: false, error: AUTHORIZATION_FAILURE_ERROR_MESSAGE });
    }
  },
};
