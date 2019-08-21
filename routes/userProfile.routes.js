const express = require('express');

const router = express.Router();
const controller = require('../controllers/userProfile.controller');
// const rewardController = require('../controllers/reward.controller');
const helper = require('../helpers/db/userProfile.helper');
const authHelper = require('../helpers/auth/passport');


router.get('/:offset/:limit', authHelper.authenticateUser, controller.getAllProfiles);
router.post('/', authHelper.authenticateUser, controller.addUserProfile);
// router.put('/', authHelper.authenticateUser, authHelper.getUserProfile, rewardController.randgoGetSessionTokenMiddleware, rewardController.randgoMembersImportUpdateProfileMiddleware, controller.updateUserProfile);
router.put('/', authHelper.authenticateUser, authHelper.getUserProfile, controller.updateUserProfile);
router.get('/', authHelper.authenticateUser, controller.getUserProfile);
router.delete('/:id', authHelper.authenticateUser, controller.deleteUserProfile);


// BOOKMARKS
router.get('/:id/bookmarks', authHelper.authenticateUser, authHelper.getUserProfile, controller.getBookmarkedArticles);
router.delete('/:id/bookmarks/:bookmark_id', authHelper.authenticateUser, controller.removeBookmark);

// FAVOURITE TAGs
router.post('/:id/tags/:tag_id', authHelper.authenticateUser, controller.addFavouriteTag);
router.delete('/:id/tags/:favouriteTag_id', authHelper.authenticateUser, controller.removeFavouriteTag);

// LIFEGOAL ROUTES
router.post('/:id/goals', authHelper.authenticateUser, controller.addLifeGoal);
router.get('/:id/goals/:goal_id', authHelper.authenticateUser, controller.getLifeGoal);

// CONSUMED BY ONESIGNAL CRON
router.get('/weeklysummary', controller.getWeeklySummaryProfiles);
module.exports = router;
