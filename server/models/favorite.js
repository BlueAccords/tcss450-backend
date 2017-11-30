'use strict';

/**
  String movieTitle = jsonPart.getString("title");
  String moviePoster = jsonPart.getString("poster_path");
  String movieOverview = jsonPart.getString("overview");
  String movieYear = jsonPart.getString("release_date");
  String backdrop = jsonPart.getString("backdrop_path"); 
 */

module.exports = (sequelize, DataTypes) => {
  var Favorite = sequelize.define('Favorite', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'composite_user_favorite_index',
      validate: {
        len: {
          args: [1,500],
          msg: "Movie title must be less than 500 characters"
        }
      },
    },
    release_date: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'composite_user_favorite_index',
      validate: {
        min: {
          args: 1,
          msg: "Year must be at least 1"
        }
      }
    },
    poster_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    backdrop_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    overview: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'composite_user_favorite_index',
      validate: {
        min: {
          args: 1,
          msg: "User id must at least be 1 or greater"
        },
        is: { 
          args: /^[0-9]+$/i,
          msg: "User id must be numeric"
        }, 
      }
    }
  }, {
    hooks: {
      // hooks like before/after create go here
    },
    classMethods: {
      associate: function(models) {
        Favorite.belongsTo(models.User, {
          foreignKey: 'userId',
          onDelete: 'CASCADE',
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