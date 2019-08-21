const utility = require('../helpers/utilities');
const responseHelper = require('../helpers/response/response.helper');
const authDbHelper = require('../helpers/db/auth.helper');
const authDbKnexHelper = require('../helpers/db/auth.knex.helper');
const errorHandler = require('../helpers/errors/error.handler');
const appConfig = require('../config').appConfig();

const forgetPassword = (req, res) => {
  if (!utility.own(req.body, ['email']))
    return responseHelper.send(errorHandler.missingNeededInput, null, res);
  authDbHelper
    .forgetPassword(req.body.email)
    .then(() =>
      responseHelper.send(
        null,
        {
          success: true,
          sent: true
        },
        res
      )
    )
    .catch((err) => responseHelper.send(err, null, res));
};

const getForgetPassword = (req, res) => {
  const { token } = req.params;
  if (!token) return responseHelper.send(errorHandler.missingNeededInput, null, res);
  authDbHelper
    .getForgetPassword(token)
    .then(() =>
      responseHelper.send(
        null,
        'An email has been sent to your email address with a new password',
        res
      )
    )
    .catch((err) => responseHelper.send(err, null, res));
};

const changePassword = (req, res) => {
  if (!utility.own(req.body, ['token', 'password']))
    return responseHelper.send(errorHandler.missingNeededInput, null, res);
  authDbHelper
    .changePassword(req.body)
    .then((result) => responseHelper.send(null, result, res))
    .catch((err) => responseHelper.send(err, null, res));
};

const sendVerifyEmail = (req, res) => {
  if (!utility.own(req.body, ['email']))
    return responseHelper.send(errorHandler.missingNeededInput, null, res);
  authDbHelper
    .sendVerifyEmail(req.body.email)
    .then((result) => responseHelper.send(null, result, res))
    .catch((err) => responseHelper.send(err, null, res));
};

const register = (req, res) => {
  if (!utility.own(req.body, ['password', 'email']))
    return responseHelper.send(errorHandler.missingNeededInput, null, res);
  authDbKnexHelper
    .register(req.body)
    .then((result) => responseHelper.send(null, result, res))
    .catch((err) => responseHelper.send(err, null, res));
};

const verify = (req, res) => {
  const token = req.params.token;
  if (!token) return responseHelper.send(errorHandler.missingNeededInput, null, res);
  authDbKnexHelper
    .verifyToken(token)
    .then((result) => {
      res.redirect(`${result.companyUrl}?verifyRedirect=true`);
    })
    .catch((err) => responseHelper.send(err, null, res));
};

const resendVerifyEmail = (req, res) => {
  authDbKnexHelper
    .resendVerifyEmail(req.body)
    .then((result) => responseHelper.send(null, result, res))
    .catch((err) => responseHelper.send(err, null, res));
};

const renderConfirmed = (req, res) => {
  res.render('accountverified', {
    fc: appConfig.verifiedTemplate.fc,
    title: appConfig.verifiedTemplate.title,
    content: appConfig.verifiedTemplate.content,
    img: appConfig.verifiedTemplate.img
  });
};

const login = (req, res) => {
  if (!utility.own(req.body, ['email', 'password'])) {
    return responseHelper.send(errorHandler.missingNeededInput, null, res);
  }
  authDbKnexHelper
    .login(req.body)
    .then((result) => responseHelper.send(null, result, res))
    .catch((err) => responseHelper.send(err, err, res));
};

const completeUserCreation = (req, res) => {
  authDbHelper
    .completeUserCreation(req.body)
    .then((user) => responseHelper.send(null, user, res))
    .catch((err) => responseHelper.send(err, null, res));
};


module.exports = {
  register,
  verify,
  resendVerifyEmail,
  renderConfirmed,
  sendVerifyEmail,
  forgetPassword,
  getForgetPassword,
  changePassword,
  login,
  completeUserCreation
};
