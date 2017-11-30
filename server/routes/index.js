const usersController = rootRequire('server/controllers').users;
const favoritesController = rootRequire('server/controllers').favorites;

module.exports = function(app) {
  app.get('/api', (req, res) => res.status(200).send({
    message: "Welcome to the Users API!",
  }));

  app.post('/api/users/register', usersController.create);
  app.post('/api/users/login', usersController.login);
  app.post('/api/users/confirm', usersController.confirmAccount);
  app.post('/api/favorites', favoritesController.addFavorite);
  app.post('/api/favorites/remove', favoritesController.removeFavorite);
}