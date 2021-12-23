const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./../models/User");
const {
  JWT_SECRET,
  JWT_REFRESH_EXPIRY_TIME,
  JWT_ACCESS_EXPIRY_TIME,
} = require("./../config/env");

const createAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY_TIME,
  });
};

const createRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY_TIME,
  });
};

module.exports = {
  registerUser: async (req, res, next) => {
    const { email, fullName, password } = req.body;
    try {
      const salt = await bcrypt.genSalt();
      const newUser = {
        email: email,
        fullName: fullName,
        password: await bcrypt.hash(password, salt),
      };

      const user = await User.create(newUser);
      console.log({ msg: "new user created", user });

      res.send({ success: true, message: "User successfully created!" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  loginUser: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await User.login(email, password);

      const accessToken = createAccessToken(user._id);
      const refreshToken = createRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.send({
        success: true,
        data: {
          email: user.email,
          fullName: user.fullName,
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  updateUserAccessControl: async (req, res, next) => {},
};
