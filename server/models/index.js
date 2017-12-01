'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
//var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

let sequelize;
if (env != "PRODUCTION") {

} else {
  console.log("Starting db in production mode...");
    sequelize = new Sequelize(
      process.env.DB_PROD_DATABASE,
      process.env.DB_PROD_USERNAME,
      process.env.DB_PROD_PASSWORD,
      {
        host: process.env.DB_PROD_HOST,
        dialect: process.env.DB_PROD_DIALECT,
        port: process.env.DB_PROD_PORT,
      }
    );
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && 
      (file !== basename) &&
      (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/**
 * NOTE: This will cause the database to recreate tables every time the server is restarted.
 * This should be removed during production and changes to the database schema will need to be done via migrations
 */
if (env != "production") {
  console.log("resetting dev database");
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  .then(function(){
      return sequelize.sync({ force: true });
  })
  .then(function(){
      return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
  })
  .then(function(){
      console.log('Database synchronised.');
  }, function(err){
      console.log(err);
  });
}
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
