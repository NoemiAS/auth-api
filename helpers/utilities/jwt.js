const jwt = require('jwt-simple');
const _ = require('lodash');
const moment = require('moment');

// get secret key for jwt in appConfig
const secretKey = _.get(require('../../config').appConfig(), 'jwt.secretKey');

if (!secretKey) logger.error('no jwt secret key');

const encodePayload = (payload) => {
  const token = jwt.encode(payload, secretKey);
  return token;
};

const decodeToken = (token) => {
  const payload = jwt.decode(token, secretKey);
  return payload;
};

const generatePayload = (id) => {
  const payload = {
    id,
    createdAt: moment().toISOString(),
  };
  return payload;
};

const generateToken = (id) => {
  const payload = generatePayload(id);
  const token = encodePayload(payload);
  return token;
};

module.exports = {
  encodePayload,
  decodeToken,
  generatePayload,
  generateToken,
};
