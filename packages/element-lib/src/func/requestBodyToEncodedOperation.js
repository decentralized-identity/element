const encodeJson = require('./encodeJson');
// TODO: check or compute proof of work
module.exports = ({ header, payload, signature }) => encodeJson({ header, payload, signature });
