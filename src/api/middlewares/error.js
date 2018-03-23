/* eslint-disable no-restricted-syntax,no-param-reassign,no-prototype-builtins */
const httpStatus = require('http-status');

/**
 * Change mongoose validation errors
 */
const formValidation = (err, req, res, next) => {
  if (err.name !== 'ValidationError') return next(err);

  for (const key in err.errors) {
    if (err.errors.hasOwnProperty(key)) {
      err.errors[key] = err.errors[key].message;
    }
  }

  return res.status(400).json(err);
};

/**
 * Catch invalid token error
 */
const invalidToken = (err, req, res, next) => {
  if (err.name !== 'UnauthorizedError') return next(err);
  const message = (err.message === 'jwt expired') ? 'Token has been expired' : 'Invalid token';
  return res.status(httpStatus.UNAUTHORIZED).json({ message });
};

/**
 * Catch not found elements
 */
const wrongUrlParam = (err, req, res, next) => {
  if (err.name !== 'CastError') return next(err);
  return res.status(404).json({ message: `Can't find element with ${err.path} ${err.value}` });
};

/**
 * Unexpected errors handler
 */
const other = (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  res.status(err.status || 500);
  console.error(err);
  res.json(err);
};

module.exports = [formValidation, invalidToken, wrongUrlParam, other];
