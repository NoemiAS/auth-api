const countryHelper  = require('../helpers/db/country.helper');
const responseHelper = require('../helpers/response/response.helper');

const addCountry = (req, res) => {
    countryHelper.addCountry(req.body, function(err, country) {
        responseHelper.send(err, country, res);
    });
}

const updateCountry = (req, res) => {
    countryHelper.updateCountry(req.params.id, req.body, function(err, country) {
        responseHelper.send(err, country, res);
    });
}

const getAllCountries = (req, res) => {
    countryHelper.getAllCountries(function(err, countries){
        responseHelper.send(err, countries, res);
    })
}

const deleteCountry = (req, res) => {
    countryHelper.deleteCountry(req.params.id, function(err, country){
        responseHelper.send(err, country, res);
    })
}

module.exports = {
    addCountry : addCountry,
    updateCountry : updateCountry,
    getAllCountries : getAllCountries,
    deleteCountry : deleteCountry
}
