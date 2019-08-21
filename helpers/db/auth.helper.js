const _ = require('lodash');
const models = require('../../models');
const moment = require('moment');
const errorHandler = require('../errors/error.handler');
const emailHelper = require('../notification/email.helper');
const passwordHelper = require('../utilities/password');
const userNotificationHelper = require('./userNotification.helper');
const userHelper = require('./user.helper');
const userProfileHelper = require('./userProfile.helper');
const jwtHelper = require('../utilities/jwt');
const conveyHelper = require('../auth/convey');
const config = require('../../config').appConfig();
const logger = require('./logging.helper');
const companyKnexHelper = require('./company.knex.helper');

const register = async (body) => {
  let {
    password,
    email,
    company,
    status,
  } = body;
  email = _.toLower(email);

  if (!company) {
    company = await companyKnexHelper.getCompanyById(1);
  }

  // check if email is already taken
  const user = await models.user.findOne({
    where: {
      email,
    },
  });
  if (user) throw errorHandler.emailAlreadyExists;
  // hash password
  const hashPassword = passwordHelper.hashPasswordSalt(password);
  // create the user
  if (!body.status || body.status === null) body.status = 1;
  const newUser = await models.user.create({
    password: hashPassword,
    email,
    status: body.status,
    companyId: body.company,
  });

  const authToken = await createAuthToken(newUser.id);
  // send verify email
  if (body.status === 1) {
    const message = await emailHelper.sendVerifyEmail(newUser.email, authToken.token, body.company);
  }
  const result = {
    newUser,
    token: authToken.token,
  };
  logger.info(`User successfully registered ${result.newUser.email}`);
  return result;
};

const verifyToken = async (token) => {
  // check if token is valid
  const authToken = await models.auth.findOne({
    where: {
      token,
    },
  });

  if (!authToken) throw errorHandler.tokenNotFound;
  // check if token is expired
  const expiredAt = moment(authToken.expiredAt);
  if (moment().isSameOrAfter(expiredAt)) throw errorHandler.tokenExpired;
  // update user
  const user = await models.user.findById(authToken.userId);

  if (user.status === 2) throw errorHandler.accountAlreadyVerified;
  let updatedUser = await user.updateAttributes({
    status: 2,
  });
  // not currently destroying token in order to monitor registration
  // process for errors in auth token save
  // await authToken.destroy();
  updatedUser = updatedUser.get({
    plain: true,
  });
  const result = _.omit(updatedUser, ['password', 'resetPasswordToken', 'resetPasswordExpiredAt']);
  return result;
};


const login = async (body) => {
  let {
    email,
    password,
  } = body;
  email = _.toLower(email);

  let user = await models.user.findOne({
    where: {
      email,
    },
    include: [
      {
        model: models.company,
        required: false
      },
      {
        model: models.userProfile,
        include: [
          {
            model: models.fitbit,
            required: false
          },
          {
            model: models.googleAuthorization,
            required: false,
          },
          {
            model: models.company,
            required: false
          },
        ]
      }
    ]
  });

  if (!user) throw errorHandler.userNotFound;
  //   Create a notification if the user has a profile but has not completed the questionnaire.
  if (user.userProfile && !user.userProfile.additionalData) {
    const page = 'ProfilePage';
    const notificationCategoryId = await userNotificationHelper.getNotificationCategory(page);
    if (notificationCategoryId) {
      const checkNotificationStatus = await userNotificationHelper.checkNotificationStatus(user.userProfile.id, notificationCategoryId.id);
      if (checkNotificationStatus) {
        const userNotification = {
          read: false,
          message: 'You have not completed profile questionnaire! Find it in the app menu',
          page,
          notificationCategoryId: notificationCategoryId.id,
          contentId: null,
          userProfileId: user.userProfile.id,
        };
        const userDisplayNotifications = await userNotificationHelper.addDisplayNotificationUser(
          userNotification);
      }
    }
  }

  // check if correct password
  const isCorrectPassword = passwordHelper.comparePassword(password, user.password, user.encryptionMethod);
  if (!isCorrectPassword) throw errorHandler.incorrectPassword;

  // check if the account is verified
  const isValidedEmail = user.status > 1;
  if (!isValidedEmail) throw errorHandler.accountNotVerified;

  user = await user.updateAttributes({
    lastLogin: moment().toDate(),
  });
  const token = jwtHelper.generateToken(user.id);
  const result = {
    token: `Bearer ${token}`,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      userProfile: user.userProfile,
      role: user.system_role,
      company: user.company,
    },
  };
  // console.log(result);
  logger.info(`User successfully logged in ${result.user.email}`);
  return result;
};

const sendVerifyEmail = async (email) => {
  email = _.toLower(email);
  const user = await models.user.findOne({
    where: {
      email,
    },
  });
  if (!user) throw errorHandler.userNotFound;
  const authToken = await createAuthToken(user.id);
  const message = await emailHelper.sendVerifyEmail(user.email, authToken.email, company);
  return {
    success: true,
    sent: true,
  };
};

const forgetPassword = async (email) => {
  email = _.toLower(email);
  let user = await models.user.findOne({
    where: {
      email,
    },
    include: [
      {
        model: models.userProfile,
        required: false,
        include: [
          {
            model: models.company,
            required: false
          },
        ]
      }
    ]
  });
  if (!user) throw errorHandler.userNotFound;
  if (!user.userProfile) {
    company = config.assets;
  } else {
    company = user.userProfile.company;
  }
  // if (user.userProfile)
  // create token
  user = await user.setForgetPassword();
  // send email with token
  const message = await emailHelper.sendForgotPasswordEmail(user.email, user.resetPasswordToken, company);
  return user;
};

const getForgetPassword = async (token) => {
  let user = await models.user.findOne({
    where: {
      resetPasswordToken: token,
    },
    include: [
      {
        model: models.userProfile,
        required: false,
        include: [
          {
            model: models.company,
            required: false
          },
        ]
      }
    ]
  });
  if (!user) throw errorHandler.tokenNotFound;
  if (!user.userProfile) {
    company = 'Seventeenhundred Work Life App';
  } else {
    company = user.userProfile.company.name;
  }
  // check if token is expired
  const now = moment();
  const tokenExpiry = moment(user.resetPasswordExpiredAt);
  if (now.isSameOrAfter(tokenExpiry)) throw errorHandler.tokenExpired;
  const newPassword = passwordHelper.generateToken();
  user = await user.setPassword(newPassword);
  // send email with newPassword
  const message = await emailHelper.sendNewPasswordEmail(user.email, newPassword, company);
  return user;
};

const changePassword = async (body) => {
  const {
    token,
    password,
  } = body;
  let user = await models.user.findOne({
    where: {
      resetPasswordToken: token,
    },
  });
  if (!user) throw errorHandler.tokenNotFound;
  // check expiry date
  if (moment().isSameOrAfter(moment(user.resetPasswordExpiredAt))) throw errorHandler.tokenExpired;
  user = await user.setPassword(password);
  return {
    passwordChange: true,
  };
};

const createAuthToken = async (userId) => {
  const token = passwordHelper.generateToken();
  const authToken = await models.auth.create({
    token,
    expiredAt: moment().add(2, 'days').toDate(),
    userId,
  });
  return authToken.get({
    plain: true,
  });
};

// convey variable can be fiitrKey (k-param), or email / msisdn if it is
// registered with convey. Most users only have msisdn. Used for POST route
const conveyLogin = async (body) => {
  let path = 'status'
  const conveyAuth = await conveyHelper.conveyLogin(body.conveyKey, path);
  if (!conveyAuth) throw errorHandler.userNotFound;
  if (conveyAuth.subscribed === 'n') throw errorHandler.conveyNotSubscribed;
  if (conveyAuth.name === 'StatusCodeError') throw errorHandler.conveyCustomerNotFound;
  let user = await models.user.findOne({
    where: {
      $or: [{
        conveyKey: body.conveyKey
      },
      {
        msisdn: body.msisdn
      },
      ],
    },
  });
  if (!user) {
    user = await models.user.create({
      conveyKey: body.conveyKey,
      msisdn: body.msisdn,
      status: 2,
    });
  }
  user = await user.updateAttributes({
    lastLogin: moment().toDate(),
    msisdn: conveyAuth.msisdn,
  });
  // Check if a user profile exists, passes null value if none to allow front end to
  // trigger profile creation screen.
  const userProfile = await models.userProfile.findOne({
    where: {
      userId: user.id,
    },
    include: [{
      model: models.fitbit,
      required: false,
    },
    {
      model: models.company,
      required: false,
    }],
  });

  const token = jwtHelper.generateToken(user.id);
  const result = {
    success: true,
    token: `Bearer ${token}`,
    convey: conveyAuth,
    userProfile: userProfile,
    user: {
      id: user.id,
      conveyKey: user.conveyKey,
      msisdn: user.msisdn,
      email: user.email,
      status: user.status,
      userProfile: user.userProfile,
    },

  };
  return result;
};

// Find the user from the bearer token, and if a conveyKey is associated with the user,
// check the subscription status with convey.
const silentConveyLogin = async (body) => {
  let path = 'status';
  const conveyAuth = await conveyHelper.conveyLogin(body.conveyKey, path);
  if (!conveyAuth) throw errorHandler.userNotFound;
  if (conveyAuth.subscribed === 'n') throw errorHandler.conveyNotSubscribed;
  if (conveyAuth.name === 'StatusCodeError') throw errorHandler.conveyCustomerNotFound;
  let user = await models.user.findOne({
    where: {
      id: body.id,
    },
  });
  user = await user.updateAttributes({
    lastLogin: moment().toDate(),
    msisdn: conveyAuth.msisdn,
  });
  const userProfile = await models.userProfile.findOne({
    where: {
      userId: user.id,
    },
    include: [{
      model: models.fitbit,
      required: false,
    },
    {
      model: models.company,
      required: false,
    }],
  });
  const token = jwtHelper.generateToken(user.id);
  const result = {
    success: true,
    token: `Bearer ${token}`,
    convey: conveyAuth,
    userProfile: userProfile,
    user: {
      id: user.id,
      conveyKey: user.conveyKey,
      msisdn: user.msisdn,
      email: user.email,
      status: user.status,
      userProfile: user.userProfile,
    },

  };
  return result;
};

// Find the user from the bearer token, and use the associated convey key to unsubscribe.
// Delete the conveyKey and msisdn on successful unsubscribe.
const conveyUnsubscribe = async (body) => {
  let path = 'unsubscribe';
  const unsubscribe = await conveyHelper.conveyUnsubscribe(body.conveyKey, path);
  return unsubscribe;
};

const completeUserCreation = async (body) => {
  const _user = {
    email: body.email,
    password: body.password,
    status: 2,
  };
  const createUser = await userHelper.addUser(_user);
  const _profile = {
    gender: 0,
    username: body.username,
    dateOfBirth: body.dateOfBirth,
    companyId: body.companyId,
  };
  const userId = createUser.newUser.get('id');
  const createProfile = await userProfileHelper.addUserProfile(userId, _profile);
  const userProfileId = createProfile.get('id');
  const createData = await userProfileHelper.populateAdditionalProfileData(userProfileId);
  const result = {
    createUser,
    createProfile,
  };
  return result;
};

const addPreregUser = async (body) => {
  let {
    password,
    email,
    companyId,
    status,
    encryptionMethod
  } = body;
  email = _.toLower(email);

  // check if email is already taken
  const user = await models.user.findOne({
    where: {
      email,
    },
  });
  if (user) throw errorHandler.emailAlreadyExists;
  if (!email) throw errorHandler.noEmail;
  if (!password) throw errorHandler.noPassword;
  if (!companyId) throw errorHandler.noCompany;

  // create new preregistered user
  const newUser = await models.user.create({
    password,
    email,
    status: body.status,
    companyId: body.companyId,
    encryptionMethod,
  });
  return newUser;
};

const silentLogin = async (body) => {
  let {
    email,
    password,
    employeeId,
    companyDomain,
    status,
  } = body;
  console.log('companyDomain: ', companyDomain);
  const company = await models.company.findOne({
    where: {
      domain: companyDomain,
    },
  });

  const user = await models.user.findOne({
    where: {
      $or: [{ email }, { employeeId }],
      companyId: company.id,
    },
    include: [
      {
        model: models.company,
        required: false
      },
      {
        model: models.userProfile,
        include: [
          {
            model: models.fitbit,
            required: false
          },
          {
            model: models.company,
            required: false
          },
        ],
      },
    ],
  });

  if (user) {
   // check if the account is verified
    const isValidedEmail = user.status > 1;
    if (!isValidedEmail) throw errorHandler.accountNotVerified;

    const updateUser = await user.updateAttributes({
      lastLogin: moment().toDate(),
      companyId: company.id,
    });
    const token = jwtHelper.generateToken(user.id);
    const result = {
      token: `Bearer ${token}`,
      user: {
        id: updateUser.id,
        email: updateUser.email,
        status: updateUser.status,
        company: updateUser.company,
        role: updateUser.system_role,
        userProfile: updateUser.userProfile,
      },
    };
    logger.info(`Silent login ${result.user.email}`);
    return result;
  }

  if (!user) {
    // create the user
    const user = await models.user.create({
      password: body.password,
      email: body.email,
      employeeId: body.employeeId,
      status: 2,
      companyId: company.id,
    });
    // find the created user to get whole object
    const loginUser = await models.user.findOne({
      where: {
        email: user.email,
      },
      include: [
        {
          model: models.company,
          required: false,
        },
      ],
    });
    const token = jwtHelper.generateToken(user.id);
    const result = {
      lastLogin: moment().toDate(),
      token: `Bearer ${token}`,
      user: {
        id: loginUser.id,
        email: loginUser.email,
        employeeId: loginUser.employeeId,
        status: loginUser.status,
        company: loginUser.company,
      },
    };
   // send an email to first time users coming from a portal with instructions that they will have to reset their password
    const sendNewUserEmail = await emailHelper.sendNewSilentUserEmail(loginUser.email, loginUser.company);
    logger.info(`Silent login ${result.user.email}, ${result.user.employeeId}`);
    return result;
  }
};

module.exports = {
  register,
  verifyToken,
  login,
  sendVerifyEmail,
  forgetPassword,
  getForgetPassword,
  changePassword,
  conveyLogin,
  silentConveyLogin,
  conveyUnsubscribe,
  completeUserCreation,
  addPreregUser,
  silentLogin,
  createAuthToken
};
