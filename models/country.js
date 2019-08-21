'use strict';

module.exports = function (sequelize, DataTypes) {
  var Country = sequelize.define('country', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dialingPrefix: DataTypes.STRING
  });
  return Country;
};
