const UserRole = require("../../models/UserRole");
const { SUPER_ADMIN_ROLE, AUTHORIZATION_FAILURE_ERROR_MESSAGE } = require("../../config/constants");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./env");
const User = require("../models/User");
const constants = require("./constants");

const authenticate = async (token) => {
  const decodedToken = jwt.verify(token, JWT_SECRET);
  if (decodedToken) {
    return await User.findById(decodedToken.id)
      .populate({ path: "roles", populate: "permissions" })
      .populate("permissions");
  }
};

const authorize = async (
  user,
  requiredRoles = [],
  requiredPermissions = []
) => {
  const userRoles = user.roles.map((_) => _._id);
  const userPermissions = [
    ...user.permissions.map((_) => _._id),
    ...userRoles.map((_) => _.permissions).flat(),
  ];

  return (
    user != undefined &&
    requiredRoles.every((_) => userRoles.includes(_)) &&
    requiredPermissions.every((_) => userPermissions.includes(_))
  );
};

module.exports = {
  SuperAdminCheck: async (req, res, next) => {
    const SuperAdmin = await UserRole.findOne({ name: SUPER_ADMIN_ROLE });
    if (authorize(req.locals.user, [SuperAdmin.id])) {
      next();
    } else {
      res
        .status(403)
        .send({ success: false, error: AUTHORIZATION_FAILURE_ERROR_MESSAGE });
    }
  },
  AuthenticateMiddleware: async (req, res, next) => {
    try {
      const token = req.headers.authorization || "";
      if (token) {
        const user = authenticate(token);
        res.locals.user = user;
        next();
      }
    } catch (error) {
      res.status(401).send({
        success: false,
        error: constants.AUTHENTICATION_FAILURE_ERROR_MESSAGE,
      });
    }
  },

  AuthorizeUser: authorize,
};
