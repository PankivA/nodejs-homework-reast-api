const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require('path');
const fs = require('fs/promises');
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
const dotenv = require("dotenv");

const { Types } = require("mongoose");

const { User } = require("../models/user");

const { HttpError, wrapper, sendEmail } = require("../helpers");

require("dotenv").config();

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw new HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationCode = nanoid();
  const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationCode, });

  const veryfyEmail = {
    to: email,
    subject: "Veryfy email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationCode}">Click to verify email</a>`,
  };

  await sendEmail(veryfyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(401);
  }

  if (user.verify) {
    throw new HttpError(400, "Verification has already been passed");
  }

  const veryfyEmail = {
    to: email,
    subject: "Veryfy email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationCode}">Click to verify email</a>`,
  };

  await sendEmail(veryfyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !password) {
    throw new HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw new HttpError(401);
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

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, originalname);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);

  const image = await Jimp.read(resultUpload);
  await image.cover(250, 250).write(resultUpload);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: wrapper(register),
  verify: wrapper(verify),
  resendVerify: wrapper(resendVerify),
  login: wrapper(login),
  getCurrent: wrapper(getCurrent),
  logout: wrapper(logout),
  updateSubscription: wrapper(updateSubscription),
  updateAvatar: wrapper(updateAvatar),
};