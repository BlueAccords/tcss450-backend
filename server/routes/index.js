const usersController = rootRequire('server/controllers').users;
const favoritesController = rootRequire('server/controllers').favorites;

module.exports = function(app) {
  app.get('/api', (req, res) => res.status(200).send({
    message: "Welcome to the Users API!",
  }));

  // User api routes
  app.post('/api/users/register', usersController.create);
  app.post('/api/users/login', usersController.login);
  app.post('/api/users/confirm', usersController.confirmAccount);

  // Favorites api routes
  app.post('/api/favorites', favoritesController.addFavorite);
  app.post('/api/favorites/remove', favoritesController.removeFavorite);
  app.get('/api/favorites/user/:userId', favoritesController.getUserFavorites);
  app.get('/api/favorites/single/:userId/:title/:releaseDate', favoritesController.getOneFavorite);
  // app.get('/api/favorites/list/:userId/', favoritesController.getFavoritesFromList);
}