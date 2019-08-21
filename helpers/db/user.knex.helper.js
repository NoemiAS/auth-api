const errorHandler = require('../errors/error.handler');
const passwordHelper = require('../utilities/password');
const knex = require('../knex.helper');
const _ = require('lodash');

const _bindUserModel = (data) => {
  const {
    email,
    msisdn,
    system_role,
    status,
    companyId,
    encryptionMethod,
    employeeId,
    mobile_billing_partner,
  } = data;
  let model = {
    email,
    msisdn,
    system_role: parseInt(system_role),
    status: parseInt(status),
    companyId: parseInt(companyId),
    encryptionMethod,
    employeeId: parseInt(employeeId),
    mobile_billing_partner,
  };
  model = _.omitBy(model, _.isUndefined);
  model = _.omitBy(model, _.isNaN);
  return model;
};

const getUserProfileByUserId = async (id) => {
  const query = await knex('userProfiles')
    .select('*')
    .where({ userId: id })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return query;
};

const getUserByEmail = async (email) => {
  console.log('email>>>>', email);
  const user = await knex('users')
    .select('*')
    .where({ email })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

const getUserByMsisdn = async (msisdn) => {
  const user = knex('users')
    .select('*')
    .where({ msisdn })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

const getUserById = async (id) => {
  const user = await knex('users')
    .select('*')
    .where({ id })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};


const addUser = async (body) => {
  const { password, email, company } = body;
  const checkIfUserEmailExists = await getUserByEmail(email);
  if (checkIfUserEmailExists) throw errorHandler.emailAlreadyExists;
  const hashPassword = passwordHelper.hashPasswordSalt(password);
  const _body = _bindUserModel(body);
  _body.password = hashPassword;
  _body.createdAt = new Date();
  _body.updatedAt = new Date();
  const newUser = await knex('users')
    .insert(_body)
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return newUser;
};

const addUserReturningNewUser = async (body) => {
  const result = await addUser(body);
  return result[0];
};

const updateUser = async (id, data) => {
  const _body = await _bindUserModel(data);
  _body.updatedAt = new Date();
  const updatedUser = await knex('users')
    .update(_body)
    .where({ id })
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return updatedUser;
};

const updateUserReturningUpdatedUser = async (id, data) => {
  const result = await updateUser(id, data);
  return result[0];
};

const getAllUsers = async (offset, limit) => {
  const users = await knex('users')
    .select('*')
    .limit(limit)
    .offset(offset)
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return users;
};

const deleteUser = async (id) => {
  const user = await knex('users')
    .delete('*')
    .where(id)
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

const getUserByEmployeeIdAndCompanyId = async (employeeId, companyId) => {
  const user = await knex('users')
    .select('*')
    .where({ employeeId, companyId })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

const getUserByEmailAndCompanyId = async (email, companyId) => {
  const user = await knex('users')
    .select('*')
    .where({ email, companyId })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

const getUserByEmailOrEmployeeIdAndCompanyId = async (email, employeeId, companyId) => {
  let user;
  email ? user = await getUserByEmailAndCompanyId(email, companyId) : user = await getUserByEmployeeIdAndCompanyId(employeeId, companyId);
  return user;
};

const getUserByMsisdnAndMobileBillingPartner = async (msisdn, mobileBillingPartner) => {
  const user = await knex('users')
    .select('*')
    .where({ msisdn, mobile_billing_partner: mobileBillingPartner })
    .first()
    .returning('*')
    .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

const updateTimezoneAndLastlogin = async (timezone, id) => {
  const date = new Date();
  const user = await knex('users')
  .update({
    timezoneOffset: timezone,
    lastLogin: date,
    updatedAt: date,
  })
  .where({ id })
  .returning('*')
  .catch(error => ({ code: error.code, description: error.detail }));
  return user;
};

module.exports = {
  getUserByEmail,
  getUserByMsisdn,
  getUserById,
  addUser,
  addUserReturningNewUser,
  updateUser,
  updateUserReturningUpdatedUser,
  getAllUsers,
  deleteUser,
  getUserProfileByUserId,
  getUserByEmailOrEmployeeIdAndCompanyId,
  getUserByMsisdnAndMobileBillingPartner,
  updateTimezoneAndLastlogin
};
