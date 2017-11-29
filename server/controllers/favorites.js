'use strict';

const User = rootRequire('server/models').User;

// status code constants
const httpCodes = rootRequire('server/config/statusCodes');




module.exports = {
  // # POST to /favorites
  add(req, res) {
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