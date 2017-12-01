'use strict';

const User = rootRequire('server/models').User;
// const credentials = rootRequire('server/config/secret');
const nodemailer = require('nodemailer');

// email html template(s)
const templates = rootRequire('server/templates/emailTemplate');

// status code constants
const httpCodes = rootRequire('server/config/statusCodes');


/**
 * Initalize node mailer with config options
 */
const siteName = "Cinemality";
const siteEmail = "cinemality@gmail.com";
const emailUsername = "";
const emailPassword = "";

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_PROD_USERNAME,
    pass: process.env.EMAIL_PROD_PASSWORD,
  }
});




module.exports = {
  // # POST to /users/register
  create(req, res) {
    var password = req.body.password;
    var confirmedPassword = req.body.confirmedPassword;

    // check if password and confirmed password match. If not then send error with status code 400
    if (!(password == confirmedPassword)) {
      var returnObj = {
        message: "Password and confirm passwords do not match",
        errors: [{
          message: "Password and confirm passwords do not match"
        }]
      }

      res.status(httpCodes.ClientError.badRequest).send(returnObj);
      req.connection.destroy();
      return;
    }

    // Else create user(model will do validation on fields)
    return User
      .create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      })
      .then(user => {

        // delete password values before sending to the user
        delete user.dataValues.password;
        delete user._previousDataValues.password;

        // send user email with verification code
        let mailOptions = {
          from: `\"${siteName}\" <${siteEmail}>`,
          to: user.dataValues.email,
          subject: "Cinemality Account Verification Code",
          text: "Thank you for creating an account with Cinemality\n" +
            "Below is your confirmation code\n\n" + 
            "Confirmation code: " + user.dataValues.confirmationCode,
          html: templates.getConfirmationEmailHTMLBody()
        };

        // SEND MAIL HERE
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            sendJSONError(httpCodes.ServerError.internalServerError,
              "Server Error",
              {message: error},
              res);
          }

          delete user.dataValues.confirmationCode;
          delete user._previousDataValues.confirmationCode;
          delete user.dataValues.password;
          delete user._previousDataValues.password;

          //res.status(httpCodes.Success.created).send(user);
          sendJSONSuccess(httpCodes.Success.created,
          "Successfully created user",
          user,
          res)
        });
      })
      .catch(error => {
        var returnObj = {
          message: error.name,
          errors: error.errors
        };
        delete returnObj.errors[0].value; // deleting the value so password is NOT sent back to the user even on failure
        res.status(400).send(returnObj);
      });
  },
  // # POST to /users/login
  login(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    // check if password was given
    if (password === undefined) {
      sendJSONError(httpCodes.ClientError.badRequest,
        "Bad Request",
        [{message: "Invalid Username/Email and Password Combination"}],
        res);

    }
    // Let user login via email OR uesrname. search for either OR
    return User
      .findOne({
        where: {
          $or: [{
            email: {
              $eq: username
            }
          }, {
            username: {
              $eq: username
            }
          }]
        }
      })
      .then(user => {

        // If user exists within database, validate password
        // if not then return bad request
        if (user !== null) {
          // If user is found
          // validate password against password hash
          var isValid = user.isPasswordEqualTo(password);

          // on success, return user obj(delete password from return obj)
          if (isValid) {
            delete user.dataValues.password;
            delete user._previousDataValues.password;
            delete user.dataValues.confirmationCode;
            delete user._previousDataValues.confirmationCode;

            sendJSONSuccess(httpCodes.Success.OK,
              "Sucessful Login",
              user,
              res)
            // else, return error message
          } else {
            sendJSONError(httpCodes.ClientError.badRequest,
              "Bad Request",
              [{ message: "Invalid Username/Email and Password Combination" }],
              res);
          }
        } else {
          sendJSONError(httpCodes.ClientError.badRequest,
            "Bad Request",
            [{ message: "Invalid Username/Email and Password Combination" }],
            res);
        }
      })
      .catch(error => {

        sendJSONError(httpCodes.ClientError.badRequest,
            error.name,
            error.errors,
            res);

      });
  },
  // #POST to confirm user account
  confirmAccount(req, res) {
    var username = req.body.username;
    var confirmCode = req.body.confirmCode;

    // check if password was given
    if (confirmCode === undefined) {
      sendJSONError(httpCodes.ClientError.badRequest,
        "Bad Request",
        [{message: "Confirmation code is empty. Please enter a confirmation code."}],
        res);
    }
    // Let user login via email OR uesrname. search for either OR
    return User
      .findOne({
        where: {
          $or: [{
            email: {
              $eq: username
            }
          }, {
            username: {
              $eq: username
            }
          }]
        }
      })
      .then(user => {
        if (user !== null) {
          // If user is found
          // check if user is already confirmed or not
          if (user.dataValues.confirmed) {
            sendJSONError(httpCodes.ClientError.badRequest,
                "Bad Request",
                [{ message:"User is already confirmed." }],
                res);
          }

          var isValid = user.isConfirmationCodeValid(confirmCode);
          // on success, return user obj(delete password from return obj)
          if (isValid) {
            delete user.dataValues.password;
            delete user._previousDataValues.password;

            // Update user record in database and return success/fail
            user.confirmAccount().then(result => {
              sendJSONSuccess(httpCodes.Success.OK,
                "Successfully confirmed user",
                 result, res);
            }).catch(err => {
              sendJSONError(httpCodes.ClientError.badRequest,
                  "Bad Request",
                  [{ message: "Failed to confirm user in database. Server Error."}], res);
            })
            // else, return error message
          } else {
            // check if confirmation code was past its expiration date
            // if past, then send user a new confirmation code and reset 
            // current confirmation code

            // updating expiration time to 10 mins in the future
            if(user.isConfirmationCodeExpired()) {
              user.updateConfirmationCode().then((result) => {
                sendJSONError(httpCodes.ClientError.badRequest,
                  "Bad Request",
                  [{message: "Confirmation code is expired. New reset confirmation code sent to email"}],
                  res);
              }).catch((err) => {
                sendJSONError(httpCodes.ClientError.badRequest,
                  "Bad Request",
                  [{ message: "Server error in sending new confirmation code"}], res);
              })
            } else {
              sendJSONError(httpCodes.ClientError.unauthorized,
                "Bad Request",
                [{ message:"Confirmation code is invalid" }],
                res);
            }

          }
        } else {
          sendJSONError(httpCodes.ClientError.badRequest,
            "Bad Request",
            [{message: "User with that username/email not found"}],
            res);
        }
      })
      .catch(error => {
        sendJSONError(httpCodes.ClientError.badRequest,
          error.name,
          error.errors,
          res);
      });
  }
};

// Helper Method to construct return values

function sendJSONError(code, message, err, res) {
  let returnObj = {
    message: message,
    errors: err,
  }
  res.status(code).send(returnObj);
}

function sendJSONSuccess(code, message, value, res) {
  let returnObj = {
    message: message,
    value: value
  }

  res.status(code).send(returnObj);
}