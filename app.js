/**
 * Wrapper function so files in sub directories
 * can import via root directory
 */
global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
}


const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

// db model

// set up express app
const app = express();

// log server requests to console
// app.use(logger('dev'));

// parse requests using body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// require routes, and pass it the express app
require('./server/routes')(app);

// catch all route
app.get('*', function(req, res) {
  res.status(200).send({
    message: "Hello world!!!"
  });
});

module.exports = app;
