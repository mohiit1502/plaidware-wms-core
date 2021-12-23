const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./env");
const User = require("./../models/User");

const authenticate = async (token) => {
  const decodedToken = jwt.verify(token, JWT_SECRET);
  if (decodedToken) {
    return await User.findById(decodedToken.id);
  }
};

module.exports = {
  AuthenticateMiddleware: async (req, res, next) => {
    try {
      const token = req.headers.authorization || "";
      if (token) {
        const user = authenticate(token);
        res.locals.user = user;
        next();
      }
    } catch (error) {
      res.status(401).send({ success: false, error: "Authentication Failed!" });
    }
  },
};
