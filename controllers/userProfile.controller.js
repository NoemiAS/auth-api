'use strict';
const userProfileHelper = require('../helpers/db/userProfile.helper');
const responseHelper = require('../helpers/response/response.helper');

const addUserProfile = (req, res) => {
  userProfileHelper.addUserProfile(req.user, req.body)
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res));
};

const updateUserProfile = (req, res) => {
  userProfileHelper.updateUserProfile(req.userProfile, req.body)
    .then(userProfile => responseHelper.send(null, userProfile, res))
    .catch(err => responseHelper.send(err, null, res))
};

const getUserProfile = (req, res) => {
  userProfileHelper.getUserProfileByUserId(req.user.id)
    .then(userProfile => responseHelper.send(null, userProfile, res))
    .catch(err => responseHelper.send(err, null, res));
};

const getAllProfiles =  (req, res) => {
  const offset = req.params.offset || 0;
  const limit = req.params.limit || 10;
  userProfileHelper.getAllProfiles(offset, limit, function (err, profiles) {
    responseHelper.send(err, profiles, res);
  });
}

const deleteUserProfile = (req, res) => {
  userProfileHelper.deleteUserProfile(req.params.id, function (err, profile) {
    responseHelper.send(err, profile, res);
  });
}


module.exports = {
  addUserProfile,
  updateUserProfile,
  getUserProfile,
  getAllProfiles,
  deleteUserProfile
}
