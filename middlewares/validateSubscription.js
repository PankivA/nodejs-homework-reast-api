const { HttpError } = require("../helpers");

const validateSubscription = (schema) => {
  const func = (req, res, next) => {
    const { subscription } = req.body;
    const { error } = schema.validate(req.body);

    const allowedSubscriptions = ["starter", "pro", "business"];

    if (error) {
      if (error.details[0].context.key === "subscription") {
        throw new HttpError(400, "missing field subscription");
      }
    }

    if (!allowedSubscriptions.includes(subscription)) {
      throw new HttpError(400, "Invalid subscription value");
    }

    next();
  };
  return func;
};

module.exports = validateSubscription;