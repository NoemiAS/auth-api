const moment = require('moment');
const passwordHelper = require('../helpers/utilities/password');

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    msisdn: DataTypes.STRING,
    conveyKey: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpiredAt: DataTypes.DATE,
    lastLogin: DataTypes.DATE,
    system_role: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    encryptionMethod: {
      type: DataTypes.STRING,
      defaultValue: 'SALT'
    },
    employeeId: DataTypes.INTEGER,
    timezoneOffset: DataTypes.STRING,

  }, {
      classMethods: {
        associate: function (models) {
          User.hasOne(models.userProfile, {
            onDelete: 'cascade',
          });
          User.belongsTo(models.role, { foreignKey: 'status' });
          User.belongsTo(models.company);
        }
      },
      instanceMethods: {
        setPassword: function (password) {
          this.password = passwordHelper.hashPasswordSalt(password);
          this.resetPasswordToken = null;
          this.resetPasswordExpiredAt = null;
          this.encryptionMethod = 'SALT';
          return this.save();
        },
        setForgetPassword: function () {
          this.resetPasswordToken = passwordHelper.generateToken(6);
          this.resetPasswordExpiredAt = moment().add(2, 'days').toDate();
          return this.save();
        },
        toJSON: function () {
          let values = Object.assign({}, this.get());
          delete values.password;
          delete values.resetPasswordToken;
          delete values.resetPasswordExpiredAt;
          return values;
        },
      },
    });
  return User;
};
