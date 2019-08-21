const knex = require('../knex.helper');
const emailHelper = require('../notification/email.helper');
const userHelper = require('./user.knex.helper');
const errorHandler = require('../errors/error.handler');
const passwordHelper = require('../utilities/password');
const companyKnexHelper = require('./company.knex.helper');
const enums = require('../utilities/enums');
const jwtHelper = require('../utilities/jwt');
const companyHelper = require('./company.knex.helper');
const featureHelper = require('./feature.helper');
const deviceHelper = require('./device.knex.helper');
const crowdMobileHelper = require('./crowdMobile.helper');

const _ = require('lodash');
const moment = require('moment');

const createAuthToken = async (userId) => {
  const randomToken = passwordHelper.generateToken();
  const userAuthToken = await knex('auths')
    .insert({
      token: randomToken,
      expiredAt: moment()
        .add(2, 'days')
        .toDate(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning('*');
  return userAuthToken[0];
};

const createAuthTokenReturningNewAuthToken = async (userId) => {
  const result = await createAuthToken(userId);
  return result;
};

const getAuthToken = async (token) => {
  const getToken = await knex('auths')
    .select('*')
    .where({ token })
    .first()
    .returning('*');
  return getToken;
};

const deleteAuthTokenByUserId = async (userId) => {
  const query = await knex('auths')
    .returning('*')
    .where({ userId })
    .del()
    .catch((error) => ({ code: error.code, description: error.detail }));
  return query;
};

const generateRandomPassword = async () => {
  return passwordHelper.generateToken();
};

const omitSecretUserFields = (data) => {
  return _.omit(data, ['password', 'resetPasswordToken', 'resetPasswordExpiredAt']);
};

const checkMobileBillingPartnerStatus = async (msisdn, mobileBillingPartner) => {
  switch (mobileBillingPartner) {
    case 'crowd_mobile':
      console.log('crowd mobile user: confirming subscription status');
      await crowdMobileHelper.handleCrowdMobileSubscriptionStatus(msisdn);
      break;
    case 'freenet':
      console.log('freenet user: confirming subscription status');
      break;
    case 'lifeiq':
      console.log(
        'default user: check with each billing partner to determine which one is subscribed'
      );
      break;
    default:
      console.log(
        'invalid subscription status, redirect to info pop with redirect to mobile billing partner site'
      );
      throw errorHandler.invalidMobileBillingPartner;
  }
};

const buildLoginUserResponse = async (user) => {
  const userBearerToken = jwtHelper.generateToken(user.id);
  const userProfile = await userHelper.getUserProfileByUserId(user.id);
  let features = [];
  let company = await companyHelper.getCompanyById(user.companyId);
  if (!company) {
    company = await companyHelper.getDefaultCompany();
  }
  if (company) {
    features = await featureHelper.getFeaturesByIds(company.features);
  }
  if (userProfile) {
    const devices = await deviceHelper.getUserDevices(userProfile.id);
    userProfile.fitbit = devices.fitbit;
    userProfile.googleAuthorization = devices.google;
    userProfile.company = company;
  }
  const result = {
    token: `Bearer ${userBearerToken}`,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      userProfile: userProfile || null,
      role: user.system_role,
      company,
      features
    }
  };
  return result;
};

const register = async (body) => {
  let { password, email, company: companyId, status, mobileBillingPartner, msisdn } = body;
  email = _.toLower(email);
  if (_.isUndefined(mobileBillingPartner)) {
    mobileBillingPartner = 'lifeiq';
  }
  if (msisdn) {
    const verifyMsisdnUniqueness = await userHelper.getUserByMsisdn(msisdn);
    if (verifyMsisdnUniqueness) throw errorHandler.phoneAlreadyExists;
    await checkMobileBillingPartnerStatus(msisdn, mobileBillingPartner);
  }
  if (_.isUndefined(companyId)) {
    const defaultCompany = await companyKnexHelper.getDefaultCompany();
    companyId = defaultCompany.id;
  }
  const verifyEmailUniqueness = await userHelper.getUserByEmail(email);
  if (verifyEmailUniqueness) throw errorHandler.emailAlreadyExists;
  if (_.isUndefined(status)) {
    status = 1;
  }
  if (_.isUndefined(password)) {
    password = await generateRandomPassword();
  }
  const _body = {
    email,
    password,
    companyId,
    status,
    msisdn,
    mobile_billing_partner: mobileBillingPartner
  };
  console.log('body', _body);
  const newUser = await userHelper.addUserReturningNewUser(_body);
  console.log('new user: ', newUser);
  const authToken = await createAuthTokenReturningNewAuthToken(newUser.id);
  if (newUser.status === enums.STATUS.INACTIVE) {
    await emailHelper.sendVerifyEmail(newUser.email, authToken.token, body.company);
  }
  const result = {
    newUser: omitSecretUserFields(newUser),
    token: authToken.token
  };
  return result;
};

const checkTokenValidity = async (authToken) => {
  if (moment().isSameOrAfter(moment(authToken.expiredAt))) throw errorHandler.tokenExpired;
};

const verifyToken = async (token) => {
  const authToken = await getAuthToken(token);
  if (!authToken) throw errorHandler.tokenNotFound;
  await checkTokenValidity(authToken);
  const user = await userHelper.getUserById(authToken.userId);
  if (user.status === enums.STATUS.ACTIVE) throw errorHandler.accountAlreadyVerified;
  const _body = {
    status: 2
  };
  const updatedUser = await userHelper.updateUserReturningUpdatedUser(authToken.userId, _body);
  const result = omitSecretUserFields(updatedUser);
  const company = await knex
    .select('companies.*')
    .from('companies')
    .where('id', updatedUser.companyId)
    .first()
    .catch((err) => { });
  const companyUrl = company.webDomain;
  return {
    result,
    companyUrl
  };
};

const login = async (body) => {
  const user = await userHelper.getUserByEmail(body.email);
  if (!user) throw errorHandler.userNotFound;
  if (user.msisdn) {
    await checkMobileBillingPartnerStatus(user.msisdn, user.mobile_billing_partner);
  }
  const verifyUserPassword = passwordHelper.comparePassword(
    body.password,
    user.password,
    user.encryptionMethod
  );
  if (!verifyUserPassword) throw errorHandler.incorrectPassword;
  if (user.status === enums.STATUS.INACTIVE) throw errorHandler.accountNotVerified;
  const _updateUserBody = {
    lastLogin: new Date()
  };
  await userHelper.updateUserReturningUpdatedUser(user.id, _updateUserBody);
  const loginUser = await buildLoginUserResponse(user);
  return loginUser;
};

const resendVerifyEmail = async (body) => {
  const email = body.email;
  const user = await userHelper.getUserByEmail(email);
  await deleteAuthTokenByUserId(user.id);
  const authToken = await createAuthToken(user.id);
  await emailHelper.sendVerifyEmail(user.email, authToken.token, null);
  return {
    success: true,
    sent: true
  };
};

const silentLogin = async (body) => {
  const { email, employeeId, domain } = body;
  const company = await companyHelper.getCompanyByDomain(domain);
  if (!company) throw errorHandler.noCompany;
  const user = await userHelper.getUserByEmailOrEmployeeIdAndCompanyId(
    email,
    employeeId,
    company.id
  );
  if (!user) {
    body.status = 2;
    body.company = company.id;
    const newUser = await register(body);
    await emailHelper.sendNewSilentUserEmail(newUser.email, company);
    return newUser;
  } else {
    const _updateUserBody = {
      lastLogin: new Date()
    };
    await userHelper.updateUserReturningUpdatedUser(user.id, _updateUserBody);
    const loginUser = await buildLoginUserResponse(user);
    return loginUser;
  }
};

module.exports = {
  register,
  verifyToken,
  login,
  resendVerifyEmail,
  silentLogin
};
