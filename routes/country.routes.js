var express = require('express');
var router = express.Router();
var controller = require('../controllers/country.controller');
var authHelper = require('../helpers/auth/passport');

router.post('/', controller.addCountry);
router.put('/:id', controller.updateCountry);
router.get('/:offset/:limit', controller.getAllCountries);
router.delete('/:id', controller.deleteCountry);

module.exports = router;
