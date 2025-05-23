const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistToken = require("../models/blacklist.model");
module.exports.registerUser = async (req, res, next) => {
  const errorMessage = validationResult(req);
  if (!errorMessage.isEmpty()) {
    return res.status(400).json({ errors: errorMessage.array() });
  }

  const { fullname, email, password } = req.body;

  const hashedPassword = await userModel.hashedPassword(password);

  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
  });

  const token = user.generateAuthToken();

  res.status(201).json({ user, token });
};

module.exports.loginUser = async (req, res, next) => {
  const errorMessage = validationResult(req);
  if (!errorMessage.isEmpty()) {
    return res.status(400).json({ errors: errorMessage.array() });
  }

  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = user.generateAuthToken();
  res.cookie("token", token);

  res.status(200).json({ user, token });
};

module.exports.getUserProfile = async (req, res, next) => {
  // const user = await userModel.findById(req.user._id).select("-password");
  res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blacklistToken.create({ token });
  res.status(200).json({ message: "Logged out successfully" });
};
