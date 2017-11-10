'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "User with that username already exists"
      },
      validate: {
        is: { 
          args: /^[a-z0-9_]+$/i,
          msg: "Username must only use characters a-Z, A-Z, 0-9, and _"
        }, 
        len: {
          args: [6,20],
          msg: "Username must be between 6-20 characters"
        }
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Must be a valid email address, for example: foo@bar.com"
        },
        notEmpty: {
          msg: "Email must not be empty"
        },
        len: {
          args: [6, 100],
          msg: "Email must be at least 5 characters"
        }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password must not be empty"
        },
        is: {
          args: /^[a-z0-9_!@#$%^&*()-_]+$/i,
          msg: "Username must only use characters a-Z, A-Z, 0-9, and !@#$%^&*()-_"
        },
        len: {
          args: [6,30],
          msg: "Password must be between 6-30 characters long"  
        },
      },
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    confirmationCodeExpirationTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: function() {
        // Default value after user create is 10 minutes from creation
        const dateInTenMinutes = new Date();
        return dateInTenMinutes.setMinutes(dateInTenMinutes.getMinutes() + 10);
      }
    },
    confirmationCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: function() {
        // Generates random 4 digit number for confirmation code
        return Math.floor(Math.random() * 9000) + 1000;
      }
    }
  }, {
    hooks: {
      beforeCreate: function(user) {
        const SALT_ROUNDS = 12;
        return bcrypt.hash(user.password, SALT_ROUNDS).then(function(hash) {
          user.setDataValue('password', hash);
        });
      }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  // instance methods
  User.prototype.isPasswordEqualTo = function(password) {
    return bcrypt.compareSync(password, this.password)
  };

  // check if confirmation code is valid and time is not past the expiration date for the code
  // If expiration date is passed, reset the confirmation code and send a new email with the new code.
  User.prototype.isConfirmationCodeValid = function(confirmationCode) {
    var isCodeEqual = confirmationCode == this.confirmationCode;
    var isDateValid = new Date() <= this.confirmationCodeExpirationTime;

    return (isCodeEqual && isDateValid);
  };

  User.prototype.isConfirmationCodeExpired = function() {
    console.log("pintail");
    var isDateExpired = new Date() >= this.confirmationCodeExpirationTime;
    return isDateExpired;
  }

  User.prototype.updateConfirmationCode = function() {
    // generate new confirmation code
    // updating expiration time to 10 mins in the future
    var dateInTenMinutes = new Date();
    dateInTenMinutes.setMinutes(dateInTenMinutes.getMinutes() + 10);

    this.setDataValue('confirmationCode',
      Math.floor(Math.random() * 9000) + 1000);

    this.setDataValue('confirmationCodeExpirationTime',
      dateInTenMinutes.setMinutes(dateInTenMinutes.getMinutes() + 10));

    
    // save to db
    return this.update({
      confirmationCode: Math.floor(Math.random() * 9000) + 1000,
      confirmationCodeExpirationTime: dateInTenMinutes.setMinutes(dateInTenMinutes.getMinutes() + 10)
    });
  }

  User.prototype.confirmAccount = function() {
    return this.set('confirmed', true).save();
  };

  return User;
};