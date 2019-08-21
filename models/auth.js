'use strict';
const uuid = require('uuid');

module.exports = function (sequelize, DataTypes) {
  var Auth = sequelize.define('auth', {
    token: {
      type: DataTypes.STRING,
      unique: true
    },
    expiredAt: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {
        Auth.belongsTo(models.user)
      }
    }
  }, {
    indexes: {
      fields: ['token']
    }
  });
  return Auth;
};
