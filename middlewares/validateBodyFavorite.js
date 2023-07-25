const validateBodyFavorite = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: `missing field ${error.details[0].context.key} `,
      });
      return;
    }
    next();
  };
  return func;
};

module.exports = validateBodyFavorite;