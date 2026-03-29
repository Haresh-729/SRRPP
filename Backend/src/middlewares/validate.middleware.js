const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') =>
  (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      return next(new AppError(messages, 422));
    }

    req[source] = value;
    next();
  };

module.exports = { validate };