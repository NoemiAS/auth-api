'use strict';

module.exports = function (sequelize, DataTypes) {
  var UserProfile = sequelize.define(
    'userProfile',
    {
      username: DataTypes.STRING,
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true
      },
      gender: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false
      },
      photo: {
        type: DataTypes.STRING,
        defaultValue: 'profile.png'
      },
      location: DataTypes.STRING,
      phone: DataTypes.STRING,
      height: DataTypes.DECIMAL(10, 2),
      heightUnit: DataTypes.STRING,
      governmentId: DataTypes.STRING,
      additionalData: DataTypes.JSON,
      level: DataTypes.STRING,
      preferences: {
        type: DataTypes.STRING
      },
      oneSignalUserIds: DataTypes.ARRAY(DataTypes.STRING),
      webOneSignalUserIds: DataTypes.ARRAY(DataTypes.STRING),
      friendship: DataTypes.VIRTUAL,
      gold: DataTypes.VIRTUAL,
      silver: DataTypes.VIRTUAL,
      bronze: DataTypes.VIRTUAL,
      total: DataTypes.VIRTUAL,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      classMethods: {
        associate: function (models) {
          UserProfile.hasMany(models.goal, {
            onDelete: 'cascade'
          });
          UserProfile.hasOne(models.site);
          UserProfile.hasMany(models.bookmark, {
            onDelete: 'cascade'
          });
          UserProfile.hasMany(models.groupMember, {
            onDelete: 'cascade'
          });
          UserProfile.belongsTo(models.user),
            UserProfile.hasMany(models.favouriteTag, {
              onDelete: 'cascade'
            });
          UserProfile.belongsTo(models.company);
          UserProfile.hasMany(models.badgeProgress, {
            onDelete: 'cascade'
          });
          UserProfile.hasMany(models.friend, {
            onDelete: 'cascade'
          });
          UserProfile.hasMany(models.indicatorUserProfile, {
            onDelete: 'cascade'
          });
          UserProfile.hasMany(models.indicatorRule);
          UserProfile.hasMany(models.comment, {
            onDelete: 'cascade'
          });
          UserProfile.hasMany(models.kynQuiz, {
            onDelete: 'cascade'
          });
          UserProfile.hasMany(models.draQuiz, {
            onDelete: 'cascade'
          });
          UserProfile.belongsToMany(models.group, {
            through: {
              model: models.groupMember
            }
          });
          UserProfile.hasOne(models.fitbit, {
            onDelete: 'cascade'
          });
          UserProfile.belongsToMany(models.notificationCategory, {
            through: 'userNotification'
          });
          UserProfile.hasMany(models.notificationDisplay);
          UserProfile.hasMany(models.userAnswers);
          UserProfile.hasMany(models.liqUserAnswer);

          UserProfile.hasMany(models.dataSource, {
            onDelete: 'cascade'
          });
          UserProfile.hasOne(models.googleAuthorization, {
            onDelete: 'cascade'
          });
        }
      },
      InstanceMethods: {
        toJSON: function () {
          let values = Object.assign({}, this.get());
          values.governmentId = true;
          return values;
        }
      }
    }
  );
  return UserProfile;
};
