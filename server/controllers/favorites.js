'use strict';

const User = rootRequire('server/models').User;
const Favorite = rootRequire('server/models').Favorite;

// status code constants
const httpCodes = rootRequire('server/config/statusCodes');




module.exports = {
  // # POST to /favorites
  addFavorite(req, res) {
    return Favorite
      .create({
        userId: req.body.userId,
        title: req.body.title,
        year: req.body.year,
      })
      .then(favorite => {
          sendJSONSuccess(httpCodes.Success.created,
          "Successfully added to favorites",
          favorite,
          res)
      })
      .catch(error => {
        if(error.name == "SequelizeUniqueConstraintError") {
          sendJSONError(
            httpCodes.ClientError.badRequest,
            error.name,
            [{ message:"Cannot favorite a movie that is already favorited" }],
            res
          );
        } else {
          sendJSONError(
            httpCodes.ClientError.badRequest,
            error.name,
            error.errors,
            res
          );

        }
        
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