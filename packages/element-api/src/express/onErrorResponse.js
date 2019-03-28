/**
 * error response middleware.
 *
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @return {*}
 */
const onErrorResponse = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.log(err);
  }

  return res.json({ code: err.name, message: err.message });
};

module.exports = onErrorResponse;
