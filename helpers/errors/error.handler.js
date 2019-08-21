const defaultMessages = {
  400: 'BadRequest',
  401: 'NotAuthorized',
  403: 'Forbidden',
  404: 'NotFound',
  500: 'InternalServerError',
};

const _error = (code, message) => {
  const err = new Error(message);
  err.code = code;
  if (!message) {
    err.message = defaultMessages[code] || 'Unexpected error';
  } else {
    err.message = message;
  }
  return err;
};

const generateError = message => _error(200, message);

// general
const dataNotFound = _error(404, 'Data not found');
const internalDbError = _error(500, 'Internal database error');
const missingNeededInput = _error(400, 'Missing needed input.');
const permissionDenied = _error(200, 'Permission denied'); // change to 403 in future when front-end has error handling
const invalidParameter = _error(400, 'Invalid parameter(s)');
const userUnsubscribed = _error(400, 'User unsubscribed');

// registration
const userNotFound = generateError('User not found');
const tokenNotFound = generateError('Token not found');
const tokenExpired = generateError('Token is expired');
const emailAlreadyExists = generateError('Email already exists');
const usernameAlreadyExists = generateError('Username already exists');
const incorrectPassword = generateError('Incorrect password');

const accountAlreadyVerified = generateError('Account already verified');
const accountNotVerified = generateError('Account not verified');
const profileAlreadyExists = generateError('Profile already exists');
const invalidDateOfBirth = generateError('Invalid date of birth');
const noPassword = generateError('No password');
const noEmail = generateError('No email');
const phoneAlreadyExists = generateError('phone already exists');

module.exports = {
  generateError, // to make custom error
  dataNotFound,
  internalDbError,
  missingNeededInput,
  permissionDenied,
  invalidParameter,
  userUnsubscribed,
  userNotFound,
  tokenNotFound,
  tokenExpired,
  emailAlreadyExists,
  usernameAlreadyExists,
  incorrectPassword,
  accountAlreadyVerified,
  accountNotVerified,
  profileAlreadyExists,
  invalidDateOfBirth,
  noPassword,
  noEmail,
  phoneAlreadyExists
};
