'use strict';

module.exports = (sequelize, DataTypes) => {
  var Favorite = sequelize.define('Favorite', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeUserIndex',
      validate: {
        len: {
          args: [1,500],
          msg: "Movie title must be less than 500 characters"
        }
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInteger: {
          msg: "Year must be an integer"
        },
        notNull: {
          msg: "Year value must be present"
        }
      },
    },
  }, {
    hooks: {
      // hooks like before/after create go here
    },
    classMethods: {
      associate: function(models) {
        Favorite.belongsTo(models.User, {
          foreignKey: 'userId',
          onDelete: 'CASCADE',
          unique: 'compositeUserIndex'
        });
      }
    }
  });

  // instance methods
  // User.prototype.isPasswordEqualTo = function(password) {
  //   return bcrypt.compareSync(password, this.password)
  // };


  return Favorite;
}