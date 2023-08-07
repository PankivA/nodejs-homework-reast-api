const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");

const { User } = require("../models/user");

const { HttpError, wrapper } = require("../helpers");

require("dotenv").config();

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw new HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const { subscription } = user;

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email,
      subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  if (!req.user) {
    throw new HttpError(401, "Not authorized");
  }

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};

const updateSubscription = async (req, res) => {
  const { userId } = req.params;
  const { subscription } = req.body;

  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError(404, "User not fond");
  }

  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({ user: { subscription } });
};

module.exports = {
  register: wrapper(register),
  login: wrapper(login),
  getCurrent: wrapper(getCurrent),
  logout: wrapper(logout),
  updateSubscription: wrapper(updateSubscription),
};