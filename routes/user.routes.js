const express = require('express');

const router = express.Router();
const controller = require('../controllers/user.controller');
const authHelper = require('../helpers/auth/passport');

router.get('/:offset/:limit', controller.getAllUsers);
router.post('/', controller.addUser);
router.put('/', authHelper.authenticateUser, controller.updateUser);
router.put('/cms/:id', controller.updateUserFromCms);
router.get('/:id', controller.getUser);
router.delete('/:id', authHelper.authenticateUser, authHelper.getUserProfile, controller.deleteUser);
router.post('/byEmail', controller.getUserByEmail);
router.post('/byMsisdn', controller.getUserByMsisdn);
// change status of user
router.post('/accessCode', authHelper.authenticateUser, controller.accessCode);
router.get('/timezone/:time/:user', controller.updateTimezoneAndLastlogin);

module.exports = router;
