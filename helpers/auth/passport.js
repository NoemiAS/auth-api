'use strict';

const passport = require('passport'),
  BearerStrategy = require('passport-http-bearer').Strategy,
  jwtHelper = require('../utilities/jwt'),
  responseHelper = require('../response/response.helper'),
  errorHandler = require('../errors/error.handler'),
  _ = require('lodash'),
  models = require('../../models'),
  userProfileHelper = require('../db/userProfile.helper');

const passportInit = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new BearerStrategy((token, done) => {
    let payload = jwtHelper.decodeToken(token);
    if (!payload) return done(null, false);
    models.user.findById(payload.id)
      .then(user => {
        if (!user) return done(null, false);
        done(null, user, {
          scope: 'all'
        });
      })
      .catch(err => done(null, false));
  }));
};

const authenticateUser = (req, res, next) => {
  passport.authenticate('bearer', {
    session: false
  })(req, res, next);
};

const getUserProfile = (req, res, next) => {
  userProfileHelper.getUserProfileByUserId(req.user.id)
    .then(userProfile => {
      req.userProfile = userProfile;
      next()
    })
    .catch(err => next(err))
};

const getUserProfileByUserId = async(userId) => {
  const profile = await userProfileHelper.getUserProfileByUserId(userId);
  return profile;
};

module.exports = {
  passportInit,
  authenticateUser,
  getUserProfile,
  getUserProfileByUserId,
}
