const express = require('express');

const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const controller = require('../controllers/auth.controller');
const authHelper = require('../helpers/auth/passport');
const helper = require('../helpers/db/auth.helper');

const upload = multer({ dest: 'uploads/' });
const responseHelper = require('../helpers/response/response.helper');
const _ = require('lodash');

router.post('/register', controller.register);
router.get('/verify/:token', controller.verify);
router.post('/verify', controller.verify);
router.get('/verify/confirmverified/:token', controller.renderConfirmed);
router.post('/resendVerifyEmail', controller.resendVerifyEmail);


router.post('/sendVerifyEmail', controller.sendVerifyEmail);
router.post('/forgetPassword', controller.forgetPassword);
router.get('/forgetPassword/:token', controller.getForgetPassword);
router.post('/changePassword', controller.changePassword);
router.post('/login', controller.login);
router.post('/createuser', controller.completeUserCreation);
router.post('/preregistration', upload.any('file'), (req, res) => {
  const filepath = req.files[0].path;
  const stream = fs.createReadStream(filepath);
  let count = 0;
  let errCount = 0;
  const failures = [];
  const successfulEmails = [];
  const streamData = [];
  const writeStream = fs.createWriteStream('successfulEmails');
  var parser = csv.fromStream(stream, { headers: true })
  .on('data', (record) => {
    parser.pause();
    helper.addPreregUser(record).then(() => {
      count += 1;
      const success = {
        email: record.email,
      };
      successfulEmails.push(success);
      const emailString = JSON.stringify(record.email);
      streamData.push(emailString);
      parser.resume();
    }).catch((err) => {
      errCount += 1;
      const failure = {
        email: record.email,
        error: err.message
      };
      failures.push(failure);
      parser.resume();
    });
  }).on('error', (err) => {
    console.log(err);
  }).on('end', () => {
    const clientData = {
      successCount: count,
      successEmails: successfulEmails,
      errorCount: errCount,
      failureDetails: failures,
      message: 'This is the list',
      subject: 'Pre-reistration details.',
    };
    const emailData = streamData.toString();
    writeStream.write(emailData);
    writeStream.end();

    responseHelper.send(null, clientData, res);
    fs.unlink(filepath);
  });
});

module.exports = router;
