'use strict';

const User = rootRequire('server/models').User;
const Favorite = rootRequire('server/models').Favorite;

// status code constants
const httpCodes = rootRequire('server/config/statusCodes');




module.exports = {
  // # POST to /favorites
  addFavorite(req, res) {
    // TODO: validate user with userid exists before adding to favorites
    return Favorite
      .create({
        userId: req.body.userId,
        title: req.body.title,
        release_date: req.body.release_date,
        poster_path: req.body.poster_path,
        backdrop_path: req.body.backdrop_path,
        overview: req.body.overview
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
  // # POST to /favorites/remove
  removeFavorite(req, res) {
    return Favorite.findOne({
      where: {
        id: req.body.favoriteId,
        userId: req.body.userId
      }
    }).then(foundFavorite => {

      // if favorite/user combo is NOT found then return error.
      console.log("FOUND FAVORITES");
      console.log(foundFavorite);
      if(foundFavorite === null) {
        sendJSONError(
          httpCodes.ClientError.badRequest,
          "Invalid favorites and user id pair",
          [{ message: "Cannot remove favorite because favorite with that user id/favorite id pair does not exist"}],
          res
        );
        req.connection.destroy();
        return;
      }
      // If favorite id/user id combo found
      Favorite
        .destroy({
          where: {
            id: req.body.favoriteId,
            userId: req.body.userId
          }
        })
        .then(deletedFavorite => {
          // check if result is sucessful or not
          if(deletedFavorite == 1) {
            sendJSONSuccess(httpCodes.Success.created,
            "Successfully deleted from favorites",
            deletedFavorite,
            res)
          } else {
            sendJSONError(
              httpCodes.ClientError.badRequest,
              error.name,
              error.errors,
              res
            );
          }
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
    }).catch(error => {
      // server/sql error
      sendJSONError(
        httpCodes.ServerError.internalServerError,
        error.name,
        error.errors,
        res
      );
    })
  },
  // # GET to /favorites/:userId/
  getUserFavorites(req, res) {
    let userId = req.params.userId;

    return Favorite.findAndCountAll({
      where: {
        userId: userId
      }
    }).then(result => {
      let foundFavorites = result.rows;
      let count = result.count;

      // send successful result of found favorites and count
      if(count == 0) {
        sendJSONSuccess(
          httpCodes.Success.OK,
          "No Favorites Found",
          { count: count,
            favorites: foundFavorites
          },
          res
        );
      } else {
        sendJSONSuccess(
          httpCodes.Success.OK,
          "Success",
          { count: count,
            favorites: foundFavorites
          },
          res
        );
      }
    }).catch(error => {
      // server/sql error
      sendJSONError(
        httpCodes.ServerError.internalServerError,
        error.name,
        error.errors,
        res
      );
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