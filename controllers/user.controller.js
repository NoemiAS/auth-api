
const userHelper = require('../helpers/db/user.helper');
const userKnexHelper = require('../helpers/db/user.knex.helper');
const responseHelper = require('../helpers/response/response.helper');

const addUser =  (req, res) => {
  userHelper.addUser(req.body)
    .then(user => responseHelper.send(null, user, res))
    .catch(err => responseHelper.send(err, null, res))
};

const updateUser = (req, res) => {
  userHelper.updateUser(req.user.id, req.body)
    .then(result => {
      responseHelper.send(null, result, res);
    })
    .catch(err => {
      responseHelper.send(err, null, res);
    })
};

const getUser =  (req, res) => {
  userHelper.getUser(req.params.id)
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res))
};

const getAllUsers = (req, res) => {
  const offset = req.params.offset || 0;
  const limit = req.params.limit || 10;
  userHelper.getAllUsers(offset, limit, function (err, users) {
    responseHelper.send(err, users, res);
  });
};

const deleteUser = (req, res) => {
  userHelper.deleteUser(req.params.id)
    .then(user => responseHelper.send(null, user, res))
    .catch(err => responseHelper.send(err, null, res))
};

const accessCode = (req, res) => {
  userHelper.accessCode(req.user.id, req.body.code)
    .then(result => {
      responseHelper.send(null, result, res);
    })
    .catch(err => {
      responseHelper.send(err, null, res);
    })
};

const getUserByEmail = (req, res) => {
  userKnexHelper.getUserByEmail(req.body.email)
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res));
};

const checkEmailUniqueness = (req, res) => {
  userKnexHelper.checkEmailUniqueness(req.body.email)
  .then(result => responseHelper.send(null, result, res))
  .catch(err => responseHelper.send(err, null, res));
};

const getUserByMsisdn = (req, res) => {
  userKnexHelper.getUserByMsisdn(req.body.msisdn)
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res));
};

module.exports = {
  addUser,
  updateUser,
  getUser,
  getAllUsers,
  deleteUser,
  accessCode,
  getUserByEmail,
  getUserByMsisdn
};
