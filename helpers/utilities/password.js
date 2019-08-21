const uuid = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const hashPasswordSalt = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const comparePassword = (password, hashed, method) => {
  if (method === 'SALT') {
    const comparison = bcrypt.compareSync(password, hashed);
    return comparison;
  } else if (method === 'SHA1') {
    const hash = crypto.createHash('md5')
      .update(password).digest('hex');

    const token = crypto.createHash('SHA1')
      .update(hash).digest('hex');

    return token === hashed;
  }
  return comparePassword;
};

const generateToken = (length = 8) => {
  const token = crypto.createHash('md5')
    .update(uuid.v4()).digest('hex')
    .substring(0, length);
  return token;
};

module.exports = {
  hashPasswordSalt,
  comparePassword,
  generateToken,
};