const validateBody = require("./validateBody");
const validateBodyFavorite = require("./validateBodyFavorite");
const isValidId = require("./isValidId");
const authenticate = require("./authenticate");
const validateSubscription = require("./validateSubscription");
const upload = require('./upload');

module.exports = {
  validateBody,
  isValidId,
  validateBodyFavorite,
  authenticate,
  validateSubscription,
  upload,
};